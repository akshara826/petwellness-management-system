package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.ProfileCompletionRequestDto;
import com.petcare.petwellness.Domain.Entity.*;
import com.petcare.petwellness.Repository.*;
import com.petcare.petwellness.Service.RegistrationService;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Util.FileStorageUtil;
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

    public RegistrationServiceImp(
            EmailOtpRepository emailOtpRepository,
            UserRepository userRepository,
            PersonalInfoRepository personalInfoRepository,
            AddressRepository addressRepository,
            FileStorageUtil fileStorageUtil) {

        this.emailOtpRepository = emailOtpRepository;
        this.userRepository = userRepository;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional
    public void completeProfile(
            ProfileCompletionRequestDto request,
            MultipartFile idProof,
            MultipartFile profileImage) {

        EmailOtp emailOtp = emailOtpRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email not verified"));

        if (!emailOtp.isVerified()) {
            throw new RuntimeException("Email verification pending");
        }

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists");
        }

        String fullName = request.getFullName().trim();
        String firstName = fullName.split("\\s+")[0];

        String idProofPath = fileStorageUtil.saveFile(idProof, "id-proofs");
        String profileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");

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
        user.setApproved(false);
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
    }
}
