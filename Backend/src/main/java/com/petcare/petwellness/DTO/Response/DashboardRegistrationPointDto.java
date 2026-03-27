package com.petcare.petwellness.DTO.Response;

public class DashboardRegistrationPointDto {

    private String month;
    private long users;

    public DashboardRegistrationPointDto(String month, long users) {
        this.month = month;
        this.users = users;
    }

    public String getMonth() {
        return month;
    }

    public long getUsers() {
        return users;
    }
}
