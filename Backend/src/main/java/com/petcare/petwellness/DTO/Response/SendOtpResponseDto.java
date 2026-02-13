package com.petcare.petwellness.DTO.Response;


public class SendOtpResponseDto {

    private String message;

    public SendOtpResponseDto() {
    }

    public SendOtpResponseDto(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }
}
