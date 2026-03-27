package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.NotNull;

public class AppointmentBookRequestDto {

    @NotNull
    private Long petId;

    public Long getPetId() {
        return petId;
    }

    public void setPetId(Long petId) {
        this.petId = petId;
    }
}
