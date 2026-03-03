package com.petcare.petwellness.Domain.Entity;

import java.time.LocalDate;
import java.time.LocalDateTime;

import org.hibernate.envers.Audited;
import org.hibernate.envers.RelationTargetAuditMode;

import com.petcare.petwellness.Enums.VaccinationStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Audited
@Table(
        name = "vaccinations",
        indexes = {
                @Index(name = "idx_vaccination_pet_id", columnList = "pet_id"),
                @Index(name = "idx_vaccination_pet_id_vaccine_name", columnList = "pet_id, vaccine_name")
        }
)
public class Vaccination {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Audited(targetAuditMode = RelationTargetAuditMode.NOT_AUDITED)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pet_id", nullable = false)
    private Pet pet;

    @NotBlank
    @Column(name = "vaccine_name", nullable = false)
    private String vaccineName;

    @NotNull
    @Column(name = "vaccination_date", nullable = false)
    private LocalDate vaccinationDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "three_days_reminder_sent" ,nullable = false)
    private boolean threeDaysReminderSent=false;

    @Column(name = "one_days_reminder_sent",nullable = false)
    private boolean oneDaysReminderSent= false;

    @Column(name = "overdue_reminder_sent",nullable = false)
    private boolean overdueReminderSent=false;


    @NotBlank
    @Column(name = "dose_number", nullable=false)
    private Integer doseNumber;

    @NotBlank
    @Column(name = "veterinarian_name" ,nullable = false)
    private String veterinarianName;

    @NotBlank
    @Column(name = "prescriptionFilePath" , nullable = false)
    private String prescriptionFile;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private VaccinationStatus status = VaccinationStatus.UPCOMING;

    @Size(max = 1000)
    @Column(name = "notes", length = 1000)
    private String notes;

    @NotNull
    @Column(name = "reminder_sent", nullable = false)
    private Boolean reminderSent = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
        if (this.reminderSent == null) {
            this.reminderSent = false;
        }
        if (this.status == null) {
            this.status = VaccinationStatus.UPCOMING;
        }
    }

    public Vaccination() {
        this.status = VaccinationStatus.UPCOMING;
        this.reminderSent = false;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Pet getPet() {
        return pet;
    }

    public void setPet(Pet pet) {
        this.pet = pet;
    }

    public String getVaccineName() {
        return vaccineName;
    }

    public void setVaccineName(String vaccineName) {
        this.vaccineName = vaccineName;
    }

    public LocalDate getVaccinationDate() {
        return vaccinationDate;
    }

    public void setVaccinationDate(LocalDate vaccinationDate) {
        this.vaccinationDate = vaccinationDate;
    }

    public LocalDate getNextDueDate() {
        return nextDueDate;
    }

    public void setNextDueDate(LocalDate nextDueDate) {
        this.nextDueDate = nextDueDate;
    }

    public Integer getDoseNumber() {
        return doseNumber;
    }

    public void setDoseNumber(Integer doseNumber) {
        this.doseNumber = doseNumber;
    }

    public String getVeterinarianName() {
        return veterinarianName;
    }

    public void setVeterinarianName(String veterinarianName) {
        this.veterinarianName = veterinarianName;
    }

    public String getPrescriptionFile() {
        return prescriptionFile;
    }

    public void setPrescriptionFile(String prescriptionFile) {
        this.prescriptionFile = prescriptionFile;
    }

    public VaccinationStatus getStatus() {
        return status;
    }

    public boolean isThreeDaysReminderSent() {
        return threeDaysReminderSent;
    }

    public void setThreeDaysReminderSent(boolean threeDaysReminderSent) {
        this.threeDaysReminderSent = threeDaysReminderSent;
    }

    public boolean isOneDaysReminderSent() {
        return oneDaysReminderSent;
    }

    public void setOneDaysReminderSent(boolean twoDaysReminderSent) {
        this.oneDaysReminderSent = twoDaysReminderSent;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Boolean getReminderSent() {
        return reminderSent;
    }

    public void setReminderSent(Boolean reminderSent) {
        this.reminderSent = reminderSent;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isOverdueReminderSent() {
        return overdueReminderSent;
    }

    public void setOverdueReminderSent(boolean overdueReminderSent) {
        this.overdueReminderSent = overdueReminderSent;
    }

    public void markAsCompleted() {
        if (this.status == VaccinationStatus.UPCOMING || this.status == VaccinationStatus.OVERDUE) {
            this.status = VaccinationStatus.COMPLETED;
            return;
        }

        if (this.status == VaccinationStatus.COMPLETED) {
            return;
        }

        throw new IllegalStateException("Only UPCOMING/OVERDUE can be marked as COMPLETED");
    }
}
