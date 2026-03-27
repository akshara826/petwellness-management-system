package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.UpdateProfileRequestDto;
import com.petcare.petwellness.DTO.Response.ProfileResponseDto;
import com.petcare.petwellness.Service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@SecurityRequirement(name = "bearerAuth")
public class ProfileController {

    private final ProfileService profileService;

    public ProfileController(ProfileService profileService) {
        this.profileService = profileService;
    }

    @GetMapping({"/me"})
    public ResponseEntity<ProfileResponseDto> getMyProfile(Authentication authentication) {
        return ResponseEntity.ok(profileService.getMyProfile(authentication.getName()));
    }

    @Operation(
            summary = "Edit own profile (supports partial update and optional profileImage)"
    )
    @PatchMapping(value = {"/Edit"}, consumes = "multipart/form-data")
    public ResponseEntity<String> updateMyProfile(
            Authentication authentication,
            @Valid @ModelAttribute UpdateProfileRequestDto request) {

        profileService.updateMyProfile(authentication.getName(), request, request.getProfileImage());
        return ResponseEntity.ok("Profile updated successfully");
    }

}
