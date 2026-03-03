package com.petcare.petwellness.DTO.Response.Report;

public class HealthReportDto {

    private PetReportDto pet;
    private MedicalHistoryReportDto medicalHistory;
    private VaccinationReportDto vaccination;

    public HealthReportDto(
            PetReportDto pet,
            MedicalHistoryReportDto medicalHistory,
            VaccinationReportDto vaccination
    ) {
        this.pet = pet;
        this.medicalHistory = medicalHistory;
        this.vaccination = vaccination;
    }

    public PetReportDto getPet() {
        return pet;
    }

    public MedicalHistoryReportDto getMedicalHistory() {
        return medicalHistory;
    }

    public VaccinationReportDto getVaccination() {
        return vaccination;
    }
}