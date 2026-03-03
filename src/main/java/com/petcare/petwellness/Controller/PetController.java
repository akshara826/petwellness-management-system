package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.PetRequestDto;
import com.petcare.petwellness.DTO.Request.PetUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.PetResponseDto;
import com.petcare.petwellness.Service.PetService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.WebDataBinder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.InitBinder;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@SecurityRequirement(name = "bearerAuth")
public class PetController {

    private final PetService petService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public PetController(PetService petService, AuthenticatedUserUtil authenticatedUserUtil) {
        this.petService = petService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @Operation(summary = "Add pet for currently logged-in user")
    @PostMapping(value="/add",consumes = "multipart/form-data")
    public ResponseEntity<PetResponseDto> addPet(
            Authentication authentication,
            @Valid @ModelAttribute PetRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(petService.addPet(request, userId));
    }

    @Operation(summary = "Update pet for currently logged-in user")
    @PatchMapping(value = "/Edit/{petId}", consumes = "multipart/form-data")
    public ResponseEntity<PetResponseDto> updatePet(
            Authentication authentication,
            @PathVariable Long petId,
            @Valid @ModelAttribute PetUpdateRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(petService.updatePet(petId, request, userId));
    }

    @Operation(summary = "Delete pet for currently logged-in user")
    @DeleteMapping("/delete/{petId}")
    public ResponseEntity<String> deletePet(
            Authentication authentication,
            @PathVariable Long petId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(petService.deletePet(petId, userId));
    }

    @Operation(summary = "Get pets for currently logged-in user")
    @GetMapping("/me")
    public ResponseEntity<List<PetResponseDto>> getMyPets(Authentication authentication) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(petService.getUserPets(userId));
    }

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(MultipartFile.class, "image", new java.beans.PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                setValue(null);
            }
        });
    }
}
