package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.ForgotPasswordResetRequestDto;
import com.petcare.petwellness.DTO.Request.LoginRequestDto;
import com.petcare.petwellness.DTO.Request.SendOtpRequestDto;
import com.petcare.petwellness.DTO.Request.SetNewPasswordRequestDto;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;

public interface LoginService {

    LoginResponseDto login(LoginRequestDto request);

    void setNewPassword(String email, SetNewPasswordRequestDto request);

    void sendForgotPasswordOtp(SendOtpRequestDto request);

    void resetForgotPassword(ForgotPasswordResetRequestDto request);

}
