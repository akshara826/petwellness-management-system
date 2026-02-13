package com.petcare.petwellness.Config;

import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
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

        if (userRepository.findByEmail(adminEmail).isEmpty()) {

            User admin = new User();
            admin.setEmail(adminEmail);
            admin.setFullName("System Admin");
            admin.setFirstName("Admin");

            admin.setPassword(passwordEncoder.encode("adminssakp"));

            admin.setRole(UserRole.ADMIN);
            admin.setApproved(true);
            admin.setEmailVerified(true);
            admin.setProfileCompleted(true);
            admin.setFirstLogin(false);

            userRepository.save(admin);

            System.out.println("Default Admin Created.");
        }
    }
}
