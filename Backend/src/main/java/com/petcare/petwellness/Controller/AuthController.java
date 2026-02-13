package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.*;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;
import com.petcare.petwellness.Service.EmailOtpService;
import com.petcare.petwellness.Service.LoginService;
import com.petcare.petwellness.Service.RegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;


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

  
    @PostMapping(value = "/complete-profile", consumes = "multipart/form-data")
    public ResponseEntity<String> completeProfile(

            @ModelAttribute ProfileCompletionRequestDto request,

            @RequestParam("idProof") MultipartFile idProof,

            @RequestParam("profileImage") MultipartFile profileImage
    ) {

        registrationService.completeProfile(request, idProof, profileImage);

        return ResponseEntity.ok(
                "Profile completed successfully. Await admin approval."
        );
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(
            @Valid @RequestBody LoginRequestDto request) {

        LoginResponseDto response = loginService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/set-password")
public ResponseEntity<String> setPassword(
        @RequestHeader("Authorization") String authHeader,
        @RequestBody SetNewPasswordRequestDto request) {

    String token = authHeader.substring(7);

    loginService.setNewPassword(token, request);

    return ResponseEntity.ok("Password set successfully");
}

}
