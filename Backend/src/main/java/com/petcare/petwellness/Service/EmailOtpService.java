package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.SendOtpRequestDto;
import com.petcare.petwellness.DTO.Request.VerifyOtpRequestDto;
import com.petcare.petwellness.DTO.Response.SendOtpResponseDto;
import com.petcare.petwellness.DTO.Response.VerifyOtpResponseDto;

public interface EmailOtpService {

    SendOtpResponseDto sendOtp(SendOtpRequestDto request);
    VerifyOtpResponseDto verifyOtp(VerifyOtpRequestDto request);
}


