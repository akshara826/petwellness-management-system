package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.VaccinationRequestDto;
import com.petcare.petwellness.DTO.Request.VaccinationUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.VaccinationResponseDto;
import com.petcare.petwellness.Service.VaccinationService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/vaccinations")
@SecurityRequirement(name = "bearerAuth")
public class VaccinationController {

    private final VaccinationService vaccinationService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public VaccinationController(VaccinationService vaccinationService,
                                 AuthenticatedUserUtil authenticatedUserUtil) {
        this.vaccinationService = vaccinationService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @Operation(summary = "Add vaccination record for a pet owned by logged-in user")
    @PostMapping(value = "/pet/add/{petId}", consumes = "multipart/form-data")
    public ResponseEntity<VaccinationResponseDto> addVaccination(
            Authentication authentication,
            @PathVariable Long petId,
            @Valid @ModelAttribute VaccinationRequestDto request) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(vaccinationService.addVaccination(petId, loggedInUserId, request));
    }

    @Operation(summary = "Update vaccination record owned by logged-in user")
    @PatchMapping(value = "/Edit/{vaccinationId}", consumes = "multipart/form-data")
    public ResponseEntity<VaccinationResponseDto> updateVaccination(
            Authentication authentication,
            @PathVariable Long vaccinationId,
            @Valid @ModelAttribute VaccinationUpdateRequestDto request) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(vaccinationService.updateVaccination(vaccinationId, loggedInUserId, request));
    }

    @Operation(summary = "Delete vaccination record owned by logged-in user")
    @DeleteMapping("/delete/{vaccinationId}")
    public ResponseEntity<String> deleteVaccination(
            Authentication authentication,
            @PathVariable Long vaccinationId) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(vaccinationService.deleteVaccination(vaccinationId, loggedInUserId));
    }

    @Operation(summary = "Get vaccination records for a pet owned by logged-in user (paginated)")
    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<VaccinationResponseDto>> getPetVaccinations(
            Authentication authentication,
            @PathVariable Long petId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(vaccinationService.getPetVaccinations(petId, loggedInUserId, offset, limit));
    }

}
