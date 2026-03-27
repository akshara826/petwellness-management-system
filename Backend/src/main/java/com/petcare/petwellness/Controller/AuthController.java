package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.*;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;
import com.petcare.petwellness.Service.EmailOtpService;
import com.petcare.petwellness.Service.LoginService;
import com.petcare.petwellness.Service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final EmailOtpService emailOtpService;
    private final RegistrationService registrationService;
    private final LoginService loginService;

    public AuthController(
            EmailOtpService emailOtpService,
            RegistrationService registrationService,
            LoginService loginService) {

        this.emailOtpService = emailOtpService;
        this.registrationService = registrationService;
        this.loginService = loginService;
    }

    
    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @Valid @RequestBody SendOtpRequestDto request) {

        emailOtpService.sendOtp(request);

        return ResponseEntity.ok("OTP sent successfully");
    }

    
    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDto request) {

        emailOtpService.verifyOtp(request);

        return ResponseEntity.ok("OTP verified successfully");
    }

  
    @Operation(
            summary = "Complete profile registration",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "multipart/form-data",
                            schema = @Schema(implementation = ProfileCompletionRequestDto.class)
                    )
            )
    )
    @PostMapping(value = "/registration", consumes = "multipart/form-data")
    public ResponseEntity<LoginResponseDto> completeProfile(
            @Valid @ModelAttribute ProfileCompletionRequestDto request
    ) {
        LoginResponseDto response = registrationService.completeProfile(
                request,
                request.getIdProof(),
                request.getProfileImage()
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request) {

        LoginResponseDto response = loginService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password/send-otp")
    public ResponseEntity<String> sendForgotPasswordOtp(
            @Valid @RequestBody SendOtpRequestDto request) {
        loginService.sendForgotPasswordOtp(request);
        return ResponseEntity.ok("OTP sent successfully");
    }

    @PostMapping("/forgot-password/reset")
    public ResponseEntity<String> resetForgotPassword(
            @Valid @RequestBody ForgotPasswordResetRequestDto request) {
        loginService.resetForgotPassword(request);
        return ResponseEntity.ok("Password reset successfully");
    }

    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/set-password")
    public ResponseEntity<String> setPassword(
            Authentication authentication,
            @Valid @RequestBody SetNewPasswordRequestDto request) {

        String email = authentication.getName();
        loginService.setNewPassword(email, request);

        return ResponseEntity.ok("Password set successfully");
    }

}
