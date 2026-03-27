package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.ForgotPasswordResetRequestDto;
import com.petcare.petwellness.DTO.Request.LoginRequestDto;
import com.petcare.petwellness.DTO.Request.SendOtpRequestDto;
import com.petcare.petwellness.DTO.Request.SetNewPasswordRequestDto;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;
import com.petcare.petwellness.Domain.Entity.EmailOtp;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.EmailOtpRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.EmailOtpService;
import com.petcare.petwellness.Service.LoginService;
import com.petcare.petwellness.Util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class LoginServiceImp implements LoginService {

    private final UserRepository userRepository;
    private final EmailOtpRepository emailOtpRepository;
    private final EmailOtpService emailOtpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginServiceImp(UserRepository userRepository,
                           EmailOtpRepository emailOtpRepository,
                           EmailOtpService emailOtpService,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.emailOtpRepository = emailOtpRepository;
        this.emailOtpService = emailOtpService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
public LoginResponseDto login(LoginRequestDto request) {

    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
        throw new UnauthorizedException("Invalid credentials");
    }

    if (user.getStatus() == null || user.getStatus() == UserStatus.PENDING) {
        throw new BadRequestException("Admin approval pending");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        String reason = user.getRejectionReason() == null ? "No reason provided" : user.getRejectionReason();
        throw new BadRequestException("Application rejected: " + reason);
    }

    String token = jwtUtil.generateToken(
            user.getEmail(),
            user.getRole().name()
    );

    boolean changePasswordRequired = user.isFirstLogin();

    return new LoginResponseDto(token, changePasswordRequired);
}

@Override
public void setNewPassword(String email, SetNewPasswordRequestDto request) {

    if (email == null || email.isBlank()) {
        throw new UnauthorizedException("Invalid authenticated user context");
    }

    User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    if (!user.isFirstLogin()) {
        throw new BadRequestException("Password already set");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));

    user.setFirstLogin(false);

    userRepository.save(user);
}

@Override
public void sendForgotPasswordOtp(SendOtpRequestDto request) {
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    validateForgotPasswordEligibility(user);

    emailOtpService.sendOtp(request);
}

@Override
@Transactional
public void resetForgotPassword(ForgotPasswordResetRequestDto request) {
    User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    validateForgotPasswordEligibility(user);

    EmailOtp emailOtp = emailOtpRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new ResourceNotFoundException("OTP not requested for this email"));

    if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
        throw new BadRequestException("OTP has expired");
    }

    if (!request.getOtp().equals(emailOtp.getOtp())) {
        throw new BadRequestException("Invalid OTP");
    }

    user.setPassword(passwordEncoder.encode(request.getNewPassword()));
    userRepository.save(user);
    emailOtpRepository.deleteByEmail(request.getEmail());
}

private void validateForgotPasswordEligibility(User user) {
    if (user.isFirstLogin()) {
        throw new BadRequestException("Forgot password is available only after initial password setup");
    }

    if (user.getStatus() != UserStatus.APPROVED) {
        throw new BadRequestException("Account is not approved for password reset");
    }

    if (user.getPassword() == null || user.getPassword().isBlank()) {
        throw new BadRequestException("Password is not initialized for this account");
    }
}


}
