package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.MedicalHistoryRequestDto;
import com.petcare.petwellness.DTO.Response.MedicalHistoryResponseDto;

import java.util.List;

public interface MedicalHistoryService {

    MedicalHistoryResponseDto addMedicalHistory(Long petId, Long loggedInUserId, MedicalHistoryRequestDto request);

    List<MedicalHistoryResponseDto> getPetMedicalHistory(Long petId, Long loggedInUserId, int offset, int limit);

    MedicalHistoryResponseDto updateMedicalHistory(Long medicalHistoryId, Long loggedInUserId, MedicalHistoryRequestDto request);

    String deleteMedicalHistory(Long medicalHistoryId, Long loggedInUserId);
}
