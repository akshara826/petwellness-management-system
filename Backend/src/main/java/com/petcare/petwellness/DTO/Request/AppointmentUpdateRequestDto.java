package com.petcare.petwellness.DTO.Request;

import java.time.LocalDate;
import java.time.LocalTime;

import org.springframework.format.annotation.DateTimeFormat;

import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Enums.AppointmentType;

import jakarta.validation.constraints.Size;

public class AppointmentUpdateRequestDto {

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate appointmentDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime startTime;

    @DateTimeFormat(iso = DateTimeFormat.ISO.TIME)
    private LocalTime endTime;

    @Size(max = 100)
    private String veterinarianName;

    private AppointmentType appointmentType;

    private AppointmentStatus status;

    public LocalDate getAppointmentDate() {
        return appointmentDate;
    }

    public void setAppointmentDate(LocalDate appointmentDate) {
        this.appointmentDate = appointmentDate;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public String getVeterinarianName() {
        return veterinarianName;
    }

    public void setVeterinarianName(String veterinarianName) {
        this.veterinarianName = veterinarianName;
    }

    public AppointmentType getAppointmentType() {
        return appointmentType;
    }

    public void setAppointmentType(AppointmentType appointmentType) {
        this.appointmentType = appointmentType;
    }

    public AppointmentStatus getStatus() {
        return status;
    }

    public void setStatus(AppointmentStatus status) {
        this.status = status;
    }
}
