package com.petcare.petwellness.DTO.Response.Report;

import java.math.BigDecimal;

public class PetReportDto {

    private Long id;
    private String name;
    private String species;
    private String breed;
    private String gender;
    private Integer age;
    private BigDecimal weight;

    public PetReportDto(
            Long id,
            String name,
            String species,
            String breed,
            String gender,
            Integer age,
            BigDecimal weight
    ) {
        this.id = id;
        this.name = name;
        this.species = species;
        this.breed = breed;
        this.gender = gender;
        this.age = age;
        this.weight = weight;
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

    public String getGender() {
        return gender;
    }

    public Integer getAge() {
        return age;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    
}
