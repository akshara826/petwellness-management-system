package com.petcare.petwellness.DTO.Response;

public class DashboardAppointmentPointDto {

    private String week;
    private long appointments;

    public DashboardAppointmentPointDto(String week, long appointments) {
        this.week = week;
        this.appointments = appointments;
    }

    public String getWeek() {
        return week;
    }

    public long getAppointments() {
        return appointments;
    }
}
