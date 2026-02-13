package com.petcare.petwellness.DTO.Response;

public class VerifyOtpResponseDto {

   private String message;
    private String nextStep;

    public VerifyOtpResponseDto(String message, String nextStep) {
        this.message = message;
        this.nextStep = nextStep;
}

    public String getMessage() {
        return message;
    }

    public String getNextStep() {
        return nextStep;
    }
}