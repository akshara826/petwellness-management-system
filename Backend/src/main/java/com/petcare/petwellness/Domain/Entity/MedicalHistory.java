package com.petcare.petwellness.Domain.Entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "medical_history")
public class MedicalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false, foreignKey = @ForeignKey(name = "fk_medical_pet"))
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Pet pet;

    @NotNull
    @PastOrPresent
    @Column(name = "visit_date", nullable = false)
    private LocalDate visitDate;

    @NotBlank
    @Size(max = 100)
    @Column(name = "doctor_name", nullable = false, length = 100)
    private String doctorName;

    @Size(max = 150)
    @Column(name = "clinic_name", length = 150)
    private String clinicName;

    @NotBlank
    @Size(max = 255)
    @Column(length = 255 , nullable = false)
    private String symptoms;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false, length = 255)
    private String diagnosis;

    @NotBlank
    @Size(max = 255)
    @Column(length = 255 ,nullable = false)
    private String treatment;

    @Size(max = 255)
    @Column(length = 255)
    private String medication;

    @NotNull
    @Positive
    @Column(name = "weight_at_visit", precision = 5, scale = 2 , nullable = false)
    private BigDecimal weight;

    @NotBlank
    @Size(max = 255)
    @Column(name = "prescription_file_path", length = 255, nullable = false)
    private String prescriptionFile;

    @Column(name = "next_visit_date")
    private LocalDate nextVisitDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public MedicalHistory() {
    }

    public Long getId() {
        return id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

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

    public String getPrescriptionFile() {
        return prescriptionFile;
    }

    public void setPrescriptionFile(String prescriptionFile) {
        this.prescriptionFile = prescriptionFile;
    }

    public LocalDate getNextVisitDate() {
        return nextVisitDate;
    }

    public void setNextVisitDate(LocalDate nextVisitDate) {
        this.nextVisitDate = nextVisitDate;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
