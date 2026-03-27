package com.petcare.petwellness.DTO.Request;

import java.math.BigDecimal;
import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import com.petcare.petwellness.Enums.PetGender;

import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class PetUpdateRequestDto {

    
    @Size(max = 50)
    private String name;

    
    @Size(max = 50)
    private String species;

    @Size(max = 50)
    private String breed;

    
    private PetGender gender;

    
    @Past
    private LocalDate dateOfBirth;

    @Positive
    private BigDecimal weight;

    private MultipartFile image;

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

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public MultipartFile getImage() {
        return image;
    }

    public void setImage(MultipartFile image) {
        this.image = image;
    }
}

