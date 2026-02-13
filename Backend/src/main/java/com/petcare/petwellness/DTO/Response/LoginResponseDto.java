package com.petcare.petwellness.DTO.Response;


public class LoginResponseDto {

    private String token;
    private boolean changePasswordRequired;

    public LoginResponseDto(String token, boolean changePasswordRequired) {
        this.token = token;
        this.changePasswordRequired = changePasswordRequired;
    }

    public String getToken() {
        return token;
    }

    public boolean isChangePasswordRequired() {
        return changePasswordRequired;
    }
}
