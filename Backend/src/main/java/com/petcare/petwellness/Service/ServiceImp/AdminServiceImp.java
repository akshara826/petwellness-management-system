package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Domain.Entity.Address;
import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Repository.PersonalInfoRepository;
import com.petcare.petwellness.Repository.AddressRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.AdminService;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Util.PasswordGenerator;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;


@Service
public class AdminServiceImp implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;


    public AdminServiceImp(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            PersonalInfoRepository personalInfoRepository, AddressRepository addressRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
    }

    

    
    @Override
    public List<PendingUserResponseDto> getPendingUsers() {

        List<User> users =
                userRepository.findByProfileCompletedTrueAndApprovedFalse();

        return users.stream()
                .map(user -> new PendingUserResponseDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName()
                ))
                .collect(Collectors.toList());
    }

    
   @Override
public String approveUser(Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.isApproved()) {
        throw new RuntimeException("User already approved");
    }

    
    String tempPassword = "Temp" + System.currentTimeMillis() % 10000;


   
    user.setPassword(passwordEncoder.encode(tempPassword));

    user.setApproved(true);
    user.setFirstLogin(true);

    userRepository.save(user);

   
    emailService.sendEmail(
            user.getEmail(),
            "Account Approved - Pet Wellness",
            "Your account is approved.\n\n" +
            "Temporary Password: " + tempPassword +
            "\n\nPlease login and set new password."
    );

    return "User approved and password sent via email.";
}

@Override
@Transactional
public void createOwner(AdminCreateOwnerRequestDto request) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("User already exists");
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

    user.setRole(UserRole.OWNER);
    user.setEmailVerified(true);
    user.setProfileCompleted(true);
    user.setApproved(true); 
    user.setFirstLogin(true);

    userRepository.save(user);

    PersonalInfo personalInfo = new PersonalInfo();
    personalInfo.setUser(user);
    personalInfo.setFullName(fullName);
    personalInfo.setPhoneNumber(request.getPhoneNumber());
    personalInfo.setHighestQualification(request.getHighestQualification());
    personalInfo.setOccupation(request.getOccupation());

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


}
