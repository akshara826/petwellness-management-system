package com.petcare.petwellness.DTO.Response;

import java.time.LocalDateTime;

public class PendingUserResponseDto {

    private Long id;
    private String email;
    private String fullName;
    private LocalDateTime createdAt;

    public PendingUserResponseDto(Long id, String email, String fullName, LocalDateTime createdAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
