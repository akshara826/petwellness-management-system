package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.Size;

public class OrderCancelRequestDto {

    @Size(max = 500)
    private String reason;

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
