package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;


public class SendOtpRequestDto {

    @NotBlank(message = "Email is required")

    
    @Email(message = "Invalid email format")

   
    @Pattern(
            regexp = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
            message = "Email must contain valid domain (e.g., .com, .org)"
    )
    private String email;

    public SendOtpRequestDto() {
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
