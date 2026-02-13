package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.NotBlank;

public class SetNewPasswordRequestDto {

    @NotBlank(message = "New password is required")
    private String newPassword;

    public SetNewPasswordRequestDto() {}

    public String getNewPassword() {
        return newPassword;
    }

    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
