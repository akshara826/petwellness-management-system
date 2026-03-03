package com.petcare.petwellness.DTO.Response.Report;

import java.time.LocalDate;

public class VaccinationReportDto {

    private String vaccineName;
    private LocalDate vaccinationDate;
    private LocalDate nextDueDate;
    private Integer doseNumber;
    private String veterinarianName;
    private String status;
    private String notes;

    public VaccinationReportDto(
            String vaccineName,
            LocalDate vaccinationDate,
            LocalDate nextDueDate,
            Integer doseNumber,
            String veterinarianName,
            String status,
            String notes
    ) {
        this.vaccineName = vaccineName;
        this.vaccinationDate = vaccinationDate;
        this.nextDueDate = nextDueDate;
        this.doseNumber = doseNumber;
        this.veterinarianName = veterinarianName;
        this.status = status;
        this.notes = notes;
    }

    public String getVaccineName() {
        return vaccineName;
    }

    public LocalDate getVaccinationDate() {
        return vaccinationDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public Integer getDoseNumber() {
        return doseNumber;
    }

    public String getVeterinarianName() {
        return veterinarianName;
    }

    public String getStatus() {
        return status;
    }

    public String getNotes() {
        return notes;
    }

  
    
}