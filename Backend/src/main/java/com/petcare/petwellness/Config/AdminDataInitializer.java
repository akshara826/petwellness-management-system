package com.petcare.petwellness.Config;

import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminDataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminDataInitializer(UserRepository userRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        String adminEmail = "admin@petwellness.com";
        String adminPassword = "adminssakp";

        User admin = userRepository.findByEmail(adminEmail).orElse(null);
        if (admin == null) {
            admin = new User();
            admin.setEmail(adminEmail);
            admin.setFullName("System Admin");
            admin.setFirstName("Admin");
        }

        admin.setPassword(passwordEncoder.encode(adminPassword));

        admin.setRole(UserRole.ADMIN);
        admin.setStatus(UserStatus.APPROVED);
        admin.setRejectionReason(null);
        admin.setEmailVerified(true);
        admin.setProfileCompleted(true);
        admin.setFirstLogin(false);

        userRepository.save(admin);

        System.out.println("Default Admin Created/Updated.");
    }
}
