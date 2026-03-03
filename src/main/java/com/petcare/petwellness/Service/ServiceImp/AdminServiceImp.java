package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Domain.Entity.Address;
import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.PersonalInfoRepository;
import com.petcare.petwellness.Repository.AddressRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.AdminService;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminServiceImp implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;
    private final FileStorageUtil fileStorageUtil;


    public AdminServiceImp(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            PersonalInfoRepository personalInfoRepository, AddressRepository addressRepository,
            FileStorageUtil fileStorageUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    

    
    @Override
    public List<PendingUserResponseDto> getPendingUsers(int offset, int limit) {
        validatePagination(offset, limit);

        List<User> users = userRepository
                .findByProfileCompletedTrueAndStatus(UserStatus.PENDING,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();

        return users.stream()
                .map(user -> new PendingUserResponseDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovedUserResponseDto> getApprovedUsers(int offset, int limit) {
        validatePagination(offset, limit);
        List<User> users = userRepository
                .findByRoleAndStatus(UserRole.OWNER, UserStatus.APPROVED,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No approved user found");
        }

        return users.stream()
                .map(user -> new ApprovedUserResponseDto(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PersonalInfo personalInfo = personalInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Personal info not found for user"));

        Address address = addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for user"));

        return new AdminUserProfileResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFirstName(),
                personalInfo.getPhoneNumber(),
                personalInfo.getGender(),
                personalInfo.getHighestQualification(),
                personalInfo.getOccupation(),
                personalInfo.getFatherName(),
                personalInfo.getMotherName(),
                personalInfo.getDateOfBirth(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                user.getProfileImagePath(),
                user.getIdProofType(),
                user.getIdProofPath(),
                user.getCreatedAt()
        );
    }

    
   @Override
public String approveUser(Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("User already approved");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("Rejected user cannot be approved directly");
    }

    
    String tempPassword = "Temp" + System.currentTimeMillis() % 10000;


   
    user.setPassword(passwordEncoder.encode(tempPassword));

    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

   
    emailService.sendEmail(
            user.getEmail(),
            "Account Approved - Pet Wellness",
            "Your account is approved.\n\n" +
            "Temporary Password: " + tempPassword +
            "\n\nPlease login and set new password."
    );

    return "User approved and approval email sent.";
}

@Override
@Transactional
public String rejectUser(Long userId, String rejectionReason) {

    String reason = rejectionReason == null ? "" : rejectionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Rejection reason is required");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("Approved user cannot be rejected");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("User already rejected");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Rejected - Pet Wellness",
            "Your account request has been rejected.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "User rejected, rejection email sent, and user removed successfully.";
}

@Override
@Transactional
public String deleteApprovedUser(Long userId, String deletionReason, String requestedByEmail) {
    String reason = deletionReason == null ? "" : deletionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Deletion reason is required");
    }

    User requester = userRepository.findByEmail(requestedByEmail)
            .orElseThrow(() -> new RuntimeException("Authenticated admin not found"));

    if (requester.getId().equals(userId)) {
        throw new RuntimeException("Admin cannot delete its own account");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole() != UserRole.OWNER) {
        throw new RuntimeException("Only owner users can be deleted");
    }

    if (user.getStatus() != UserStatus.APPROVED) {
        throw new RuntimeException("Only approved users can be deleted");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Deleted - Pet Wellness",
            "Your approved account has been deleted by Admin.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "Approved user deleted successfully and deletion email sent.";
}

    @Override
    @Transactional
    public void createOwner(AdminCreateOwnerRequestDto request, MultipartFile idProof, MultipartFile profileImage) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("User already exists");
    }

    if (request.getDateOfBirth() == null || !request.getDateOfBirth().isBefore(java.time.LocalDate.now())) {
        throw new BadRequestException("Date of birth must be a past date");
    }

   String tempPassword = "Temp" + System.currentTimeMillis() % 10000;

    String encodedPassword = passwordEncoder.encode(tempPassword);

    String fullName = request.getFullName().trim();
    String firstName = fullName.split("\\s+")[0];

    User user = new User();
    user.setEmail(request.getEmail());
    user.setFullName(fullName);
    user.setFirstName(firstName);
    user.setPassword(encodedPassword);
    user.setIdProofType(request.getIdProofType());

    String idProofPath;
    String profileImagePath;
    try {
        idProofPath = fileStorageUtil.saveFile(idProof, "id-proofs");
        profileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");
    } catch (RuntimeException ex) {
        throw new BadRequestException("File upload failed: " + ex.getMessage());
    }

    user.setIdProofPath(idProofPath);
    user.setProfileImagePath(profileImagePath);

    user.setRole(UserRole.OWNER);
    user.setEmailVerified(true);
    user.setProfileCompleted(true);
    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

    PersonalInfo personalInfo = new PersonalInfo();
    personalInfo.setUser(user);
    personalInfo.setFullName(fullName);
    personalInfo.setPhoneNumber(request.getPhoneNumber());
    personalInfo.setGender(request.getGender());
    personalInfo.setHighestQualification(request.getHighestQualification());
    personalInfo.setOccupation(request.getOccupation());
    personalInfo.setFatherName(request.getFatherName());
    personalInfo.setMotherName(request.getMotherName());
    personalInfo.setDateOfBirth(request.getDateOfBirth());

    personalInfoRepository.save(personalInfo);

    Address address = new Address();
    address.setUser(user);
    address.setStreet(request.getStreet());
    address.setCity(request.getCity());
    address.setState(request.getState());
    address.setPincode(request.getPincode());

    addressRepository.save(address);

emailService.sendEmail(
        user.getEmail(),
        "Your Owner Account Created - Pet Wellness",
        "Your account has been created by Admin.\n\n" +
        "Temporary Password: " + tempPassword +
        "\n\nPlease login and set your new password."
);

}

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }


}
