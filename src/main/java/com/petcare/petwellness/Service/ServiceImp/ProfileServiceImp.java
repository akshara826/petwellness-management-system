package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.UpdateProfileRequestDto;
import com.petcare.petwellness.DTO.Response.ProfileResponseDto;
import com.petcare.petwellness.Domain.Entity.Address;
import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.AddressRepository;
import com.petcare.petwellness.Repository.PersonalInfoRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.ProfileService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.Set;

@Service
public class ProfileServiceImp implements ProfileService {

    private static final long MAX_PROFILE_IMAGE_BYTES = 5L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final UserRepository userRepository;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;
    private final FileStorageUtil fileStorageUtil;

    public ProfileServiceImp(UserRepository userRepository,
                             PersonalInfoRepository personalInfoRepository,
                             AddressRepository addressRepository,
                             FileStorageUtil fileStorageUtil) {
        this.userRepository = userRepository;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional(readOnly = true)
    public ProfileResponseDto getMyProfile(String email) {
        User user = getEligibleUser(email);
        PersonalInfo personalInfo = getPersonalInfo(user.getId());
        Address address = getAddress(user.getId());

        return new ProfileResponseDto(
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
                user.getProfileImagePath()
        );
    }

    @Override
    @Transactional
    public void updateMyProfile(String email, UpdateProfileRequestDto request, MultipartFile profileImage) {
        User user = getEligibleUser(email);
        PersonalInfo personalInfo = getPersonalInfo(user.getId());
        Address address = getAddress(user.getId());

        boolean updated = false;

        if (hasText(request.getFullName())) {
            String normalizedFullName = normalizeName(request.getFullName());
            String firstName = normalizedFullName.split("\\s+")[0];
            user.setFullName(normalizedFullName);
            user.setFirstName(firstName);
            personalInfo.setFullName(normalizedFullName);
            updated = true;
        }

        if (hasText(request.getPhoneNumber())) {
            String phoneNumber = request.getPhoneNumber().trim();
            if (!phoneNumber.matches("^[0-9]{10}$")) {
                throw new BadRequestException("Phone number must be exactly 10 digits");
            }
            personalInfo.setPhoneNumber(phoneNumber);
            updated = true;
        }

        if (request.getGender() != null) {
            personalInfo.setGender(request.getGender());
            updated = true;
        }

        if (hasText(request.getHighestQualification())) {
            personalInfo.setHighestQualification(request.getHighestQualification().trim());
            updated = true;
        }

        if (hasText(request.getOccupation())) {
            personalInfo.setOccupation(request.getOccupation().trim());
            updated = true;
        }

        if (request.getFatherName() != null) {
            personalInfo.setFatherName(trimToNull(request.getFatherName()));
            updated = true;
        }

        if (request.getMotherName() != null) {
            personalInfo.setMotherName(trimToNull(request.getMotherName()));
            updated = true;
        }

        if (request.getDateOfBirth() != null) {
            if (!request.getDateOfBirth().isBefore(java.time.LocalDate.now())) {
                throw new BadRequestException("Date of birth must be a past date");
            }
            personalInfo.setDateOfBirth(request.getDateOfBirth());
            updated = true;
        }

        if (hasText(request.getStreet())) {
            address.setStreet(request.getStreet().trim());
            updated = true;
        }

        if (hasText(request.getCity())) {
            address.setCity(request.getCity().trim());
            updated = true;
        }

        if (hasText(request.getState())) {
            address.setState(request.getState().trim());
            updated = true;
        }

        if (hasText(request.getPincode())) {
            String pincode = request.getPincode().trim();
            if (!pincode.matches("^[0-9]{6}$")) {
                throw new BadRequestException("Pincode must be exactly 6 digits");
            }
            address.setPincode(pincode);
            updated = true;
        }

        if (profileImage != null && !profileImage.isEmpty()) {
            validateProfileImage(profileImage);
            String oldProfileImagePath = user.getProfileImagePath();
            String newProfileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");
            user.setProfileImagePath(newProfileImagePath);
            fileStorageUtil.deleteFileQuietly(oldProfileImagePath);
            updated = true;
        }

        if (!updated) {
            throw new BadRequestException("No profile field provided for update");
        }

        userRepository.save(user);
        personalInfoRepository.save(personalInfo);
        addressRepository.save(address);
    }

    private User getEligibleUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != UserRole.OWNER) {
            throw new BadRequestException("Profile editing is available for owner users only");
        }

        return user;
    }

    private PersonalInfo getPersonalInfo(Long userId) {
        return personalInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Personal info not found for user"));
    }

    private Address getAddress(Long userId) {
        return addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for user"));
    }

    private String normalizeName(String name) {
        if (name == null) {
            throw new BadRequestException("Full name is required");
        }

        String normalized = name.trim().replaceAll("\\s+", " ");
        if (normalized.isEmpty()) {
            throw new BadRequestException("Full name is required");
        }

        return normalized;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }

    private void validateProfileImage(MultipartFile profileImage) {
        String contentType = profileImage.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid profile image type. Allowed: jpg, jpeg, png, webp");
        }

        if (profileImage.getSize() > MAX_PROFILE_IMAGE_BYTES) {
            throw new BadRequestException("Profile image size must be <= 5MB");
        }
    }
}
