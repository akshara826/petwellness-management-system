package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.SendOtpRequestDto;
import com.petcare.petwellness.DTO.Request.VerifyOtpRequestDto;
import com.petcare.petwellness.DTO.Response.SendOtpResponseDto;
import com.petcare.petwellness.DTO.Response.VerifyOtpResponseDto;
import com.petcare.petwellness.Domain.Entity.EmailOtp;
import com.petcare.petwellness.Repository.EmailOtpRepository;
import com.petcare.petwellness.Service.EmailOtpService;
import com.petcare.petwellness.Util.OtpGeneratorUtil;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class EmailOtpServiceImp implements EmailOtpService {

    private final EmailOtpRepository emailOtpRepository;

    public EmailOtpServiceImp(EmailOtpRepository emailOtpRepository) {
        this.emailOtpRepository = emailOtpRepository;
    }

    @Override
public SendOtpResponseDto sendOtp(SendOtpRequestDto request) {

    String email = request.getEmail();
    String generatedOtp = OtpGeneratorUtil.generateOtp();

    EmailOtp emailOtp = emailOtpRepository
            .findByEmail(email)
            .orElse(new EmailOtp());

    emailOtp.setEmail(email);
    emailOtp.setOtp(generatedOtp);
    emailOtp.setExpiryTime(LocalDateTime.now().plusMinutes(5));
    emailOtp.setVerified(false);

    emailOtpRepository.save(emailOtp);

    System.out.println("Generated OTP: " + generatedOtp);

    return new SendOtpResponseDto("OTP sent successfully");
}

@Override
public VerifyOtpResponseDto verifyOtp(VerifyOtpRequestDto request) {

    EmailOtp emailOtp = emailOtpRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("OTP not requested for this email"));

    
    if (emailOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
        throw new RuntimeException("OTP has expired");
    }

    
    if (!emailOtp.getOtp().equals(request.getOtp())) {
        throw new RuntimeException("Invalid OTP");
    }

    
    if (emailOtp.isVerified()) {
        throw new RuntimeException("OTP already verified");
    }

    emailOtp.setVerified(true);
    emailOtpRepository.save(emailOtp);

    return new VerifyOtpResponseDto(
        "OTP verified successfully",
        "COMPLETE_PROFILE"
);

}

}
