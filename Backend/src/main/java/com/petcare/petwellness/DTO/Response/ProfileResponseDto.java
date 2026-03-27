package com.petcare.petwellness.DTO.Response;

import com.petcare.petwellness.Enums.Gender;

import java.time.LocalDate;

public class ProfileResponseDto {
    private final String email;
    private final String fullName;
    private final String firstName;
    private final String phoneNumber;
    private final Gender gender;
    private final String highestQualification;
    private final String occupation;
    private final String fatherName;
    private final String motherName;
    private final LocalDate dateOfBirth;
    private final String street;
    private final String city;
    private final String state;
    private final String pincode;
    private final String profileImagePath;

    public ProfileResponseDto(
            String email,
            String fullName,
            String firstName,
            String phoneNumber,
            Gender gender,
            String highestQualification,
            String occupation,
            String fatherName,
            String motherName,
            LocalDate dateOfBirth,
            String street,
            String city,
            String state,
            String pincode,
            String profileImagePath) {
        this.email = email;
        this.fullName = fullName;
        this.firstName = firstName;
        this.phoneNumber = phoneNumber;
        this.gender = gender;
        this.highestQualification = highestQualification;
        this.occupation = occupation;
        this.fatherName = fatherName;
        this.motherName = motherName;
        this.dateOfBirth = dateOfBirth;
        this.street = street;
        this.city = city;
        this.state = state;
        this.pincode = pincode;
        this.profileImagePath = profileImagePath;
    }

    public String getEmail() {
        return email;
    }

    public String getFullName() {
        return fullName;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public Gender getGender() {
        return gender;
    }

    public String getHighestQualification() {
        return highestQualification;
    }

    public String getOccupation() {
        return occupation;
    }

    public String getFatherName() {
        return fatherName;
    }

    public String getMotherName() {
        return motherName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public String getStreet() {
        return street;
    }

    public String getCity() {
        return city;
    }

    public String getState() {
        return state;
    }

    public String getPincode() {
        return pincode;
    }

    public String getProfileImagePath() {
        return profileImagePath;
    }
}
