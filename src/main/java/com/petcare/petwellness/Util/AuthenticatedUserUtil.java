package com.petcare.petwellness.Util;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.UserRepository;

@Service
public class AuthenticatedUserUtil {

    private final UserRepository userRepository;

    public AuthenticatedUserUtil(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Long resolveCurrentUserId(Authentication authentication) {
        if (authentication == null || authentication.getName() == null || authentication.getName().isBlank()) {
            throw new UnauthorizedException("Unauthorized");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return user.getId();
    }
}
