package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class ForgotPasswordResetRequestDto {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email must contain valid domain (e.g., .com, .org)"
    )
    private String email;

    @NotBlank(message = "OTP is required")
    @Pattern(
            regexp = "^[0-9]{6}$",
            message = "OTP must be 6 digits"
    )
    private String otp;

    @NotBlank(message = "New password is required")
    private String newPassword;

    public ForgotPasswordResetRequestDto() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
