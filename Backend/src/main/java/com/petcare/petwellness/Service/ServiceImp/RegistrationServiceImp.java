package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.ProfileCompletionRequestDto;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;
import com.petcare.petwellness.Domain.Entity.*;
import com.petcare.petwellness.Repository.*;
import com.petcare.petwellness.Service.RegistrationService;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Util.FileStorageUtil;
import com.petcare.petwellness.Util.JwtUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/*
 * Handles user registration logic (after OTP verification).
 */
@Service
public class RegistrationServiceImp implements RegistrationService {

    private final EmailOtpRepository emailOtpRepository;
    private final UserRepository userRepository;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;
    private final FileStorageUtil fileStorageUtil;
    private final JwtUtil jwtUtil;

    public RegistrationServiceImp(
            EmailOtpRepository emailOtpRepository,
            UserRepository userRepository,
            PersonalInfoRepository personalInfoRepository,
            AddressRepository addressRepository,
            FileStorageUtil fileStorageUtil,
            JwtUtil jwtUtil) {

        this.emailOtpRepository = emailOtpRepository;
        this.userRepository = userRepository;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.fileStorageUtil = fileStorageUtil;
        this.jwtUtil = jwtUtil;
    }

    @Override
    @Transactional
    public LoginResponseDto completeProfile(
            ProfileCompletionRequestDto request,
            MultipartFile idProof,
            MultipartFile profileImage) {

        EmailOtp emailOtp = emailOtpRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("OTP record not found for this email"));

        if (!emailOtp.isVerified()) {
            throw new BadRequestException("Email verification pending");
        }

        User existingUser = userRepository.findByEmail(request.getEmail()).orElse(null);
        if (existingUser != null) {
            // Recovery path: user was already created but still needs to complete first-login password setup.
            if (existingUser.isFirstLogin()) {
                String token = jwtUtil.generateToken(
                        existingUser.getEmail(),
                        existingUser.getRole().name()
                );
                return new LoginResponseDto(token, true);
            }
            throw new BadRequestException("User already exists");
        }

        if (request.getDateOfBirth() == null || !request.getDateOfBirth().isBefore(java.time.LocalDate.now())) {
            throw new BadRequestException("Date of birth must be a past date");
        }

        String fullName = request.getFullName().trim();
        String firstName = fullName.split("\\s+")[0];

        String idProofPath;
        String profileImagePath;
        try {
            idProofPath = fileStorageUtil.saveFile(idProof, "id-proofs");
            profileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");
        } catch (RuntimeException ex) {
            throw new BadRequestException("File upload failed: " + ex.getMessage());
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setFullName(fullName);
        user.setFirstName(firstName);
        user.setIdProofPath(idProofPath);
        user.setIdProofType(request.getIdProofType());
        user.setProfileImagePath(profileImagePath);

        user.setRole(UserRole.OWNER);
        user.setEmailVerified(true);
        user.setProfileCompleted(true);
        user.setStatus(UserStatus.PENDING);
        user.setRejectionReason(null);
        user.setFirstLogin(true);

        userRepository.save(user);

PersonalInfo personalInfo = new PersonalInfo();

personalInfo.setUser(user);

personalInfo.setFullName(request.getFullName());
personalInfo.setGender(request.getGender());
personalInfo.setPhoneNumber(request.getPhoneNumber());
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

        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new LoginResponseDto(token, true);
    }
}
