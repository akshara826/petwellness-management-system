package com.petcare.petwellness.DTO.Request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MedicalHistoryRequestDto {

    @NotNull
    @PastOrPresent
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate visitDate;

    @NotBlank
    @Size(max = 100)
    private String doctorName;

    @Size(max = 150)
    private String clinicName;

    @NotBlank
    @Size(max = 255)
    private String symptoms;

    @NotBlank
    @Size(max = 255)
    private String diagnosis;

    @NotBlank
    @Size(max = 255)
    private String treatment;

    @Size(max = 255)
    private String medication;

    @NotBlank
    @Positive
    private BigDecimal weight;

    @NotBlank
    @Schema(type = "string", format = "binary")
    private MultipartFile prescriptionFile;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate nextVisitDate;

    public LocalDate getVisitDate() {
        return visitDate;
    }

    public void setVisitDate(LocalDate visitDate) {
        this.visitDate = visitDate;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getClinicName() {
        return clinicName;
    }

    public void setClinicName(String clinicName) {
        this.clinicName = clinicName;
    }

    public String getSymptoms() {
        return symptoms;
    }

    public void setSymptoms(String symptoms) {
        this.symptoms = symptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getTreatment() {
        return treatment;
    }

    public void setTreatment(String treatment) {
        this.treatment = treatment;
    }

    public String getMedication() {
        return medication;
    }

    public void setMedication(String medication) {
        this.medication = medication;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public MultipartFile getPrescriptionFile() {
        return prescriptionFile;
    }

    public void setPrescriptionFile(MultipartFile prescriptionFile) {
        this.prescriptionFile = prescriptionFile;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
    }
}
