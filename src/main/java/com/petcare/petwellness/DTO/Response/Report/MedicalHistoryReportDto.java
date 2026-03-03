package com.petcare.petwellness.DTO.Response.Report;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MedicalHistoryReportDto {

    private LocalDate visitDate;
    private String doctorName;
    private String clinicName;
    private String symptoms;
    private String diagnosis;
    private String treatment;
    private String medication;
    private BigDecimal weight;

    public MedicalHistoryReportDto(
            LocalDate visitDate,
            String doctorName,
            String clinicName,
            String symptoms,
            String diagnosis,
            String treatment,
            String medication,
            BigDecimal weight
    ) {
        this.visitDate = visitDate;
        this.doctorName = doctorName;
        this.clinicName = clinicName;
        this.symptoms = symptoms;
        this.diagnosis = diagnosis;
        this.treatment = treatment;
        this.medication = medication;
        this.weight = weight;
    }

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public String getClinicName() {
        return clinicName;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public String getMedication() {
        return medication;
    }

    public BigDecimal getWeight() {
        return weight;
    }

}
