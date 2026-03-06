package com.petcare.petwellness.Domain.Entity;

import java.math.BigDecimal;

import java.time.LocalDate;
import java.time.LocalDateTime;

import com.petcare.petwellness.Enums.PetGender;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

@Entity
@Table(name = "pets", uniqueConstraints = {
        @UniqueConstraint(columnNames = { "name", "user_id" })
})
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String name;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String species;

    @Size(max = 50)
    @Column(length = 50)
    private String breed;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private PetGender gender;

    @Past
    @NotNull
    @Column(name = "date_of_birth" ,nullable=false)
    private LocalDate dateOfBirth;

    @Column(name = "pet_image_path", length = 255)
    private String PetImage;

    @Positive
    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_pet_user"))
    private User user;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Pet() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getSpecies() {
        return species;
    }

    public String getBreed() {
        return breed;
    }

    public PetGender getGender() {
        return gender;
    }
    

    public String getPetImage() {
        return PetImage;
    }

    public void setPetImage(String petImage) {
        PetImage = petImage;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setSpecies(String species) {
        this.species = species;
    }

    public void setBreed(String breed) {
        this.breed = breed;
    }

    public void setGender(PetGender gender) {
        this.gender = gender;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public void setUser(User user) {
        this.user = user;
    }

}
