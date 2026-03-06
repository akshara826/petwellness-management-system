package com.petcare.petwellness.DTO.Response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import com.petcare.petwellness.Enums.PetGender;

public class PetResponseDto {

    private Long id;
    private String name;
    private String species;
    private String breed;
    private PetGender gender;
    private LocalDate dateOfBirth;
    private BigDecimal weight;
    private String imageUrl;
    private LocalDateTime createdAt;
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public String getSpecies() {
        return species;
    }
    public void setSpecies(String species) {
        this.species = species;
    }
    public String getBreed() {
        return breed;
    }
    public void setBreed(String breed) {
        this.breed = breed;
    }
    public PetGender getGender() {
        return gender;
    }
    public void setGender(PetGender gender) {
        this.gender = gender;
    }
    public BigDecimal getWeight() {
        return weight;
    }
    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }
    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }
    public String getImageUrl() {
        return imageUrl;
    }
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }


    
}
