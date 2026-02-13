package com.petcare.petwellness.DTO.Response;


public class PendingUserResponseDto {

    private Long id;
    private String email;
    private String fullName;

    public PendingUserResponseDto(Long id, String email, String fullName) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
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
}
