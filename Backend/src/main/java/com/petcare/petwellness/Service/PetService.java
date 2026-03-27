package com.petcare.petwellness.Service;

import java.util.List;

import com.petcare.petwellness.DTO.Request.PetRequestDto;
import com.petcare.petwellness.DTO.Request.PetUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.PetResponseDto;

public interface PetService {

    PetResponseDto addPet(PetRequestDto request, Long userId);

    PetResponseDto updatePet(Long petId, PetUpdateRequestDto request, Long userId);

    String deletePet(Long petId, Long userId);

    List<PetResponseDto> getUserPets(Long userId);
}
