package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.VaccinationRequestDto;
import com.petcare.petwellness.DTO.Request.VaccinationUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.VaccinationResponseDto;

import java.util.List;

public interface VaccinationService {

    VaccinationResponseDto addVaccination(Long petId, Long loggedInUserId, VaccinationRequestDto request);

    VaccinationResponseDto updateVaccination(Long vaccinationId, Long loggedInUserId, VaccinationUpdateRequestDto request);

    VaccinationResponseDto markVaccinationCompleted(Long vaccinationId, Long loggedInUserId);

    String deleteVaccination(Long vaccinationId, Long loggedInUserId);

    List<VaccinationResponseDto> getPetVaccinations(Long petId, Long loggedInUserId, int offset, int limit);
}
