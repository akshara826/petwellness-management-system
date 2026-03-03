package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.MedicalHistoryRequestDto;
import com.petcare.petwellness.DTO.Response.MedicalHistoryResponseDto;
import com.petcare.petwellness.Service.MedicalHistoryService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/medical-history")
@SecurityRequirement(name = "bearerAuth")
public class MedicalHistoryController {

    private final MedicalHistoryService medicalHistoryService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public MedicalHistoryController(MedicalHistoryService medicalHistoryService,
                                    AuthenticatedUserUtil authenticatedUserUtil) {
        this.medicalHistoryService = medicalHistoryService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @Operation(summary = "Add medical history for a pet owned by logged-in user")
    @PostMapping(value = "/pet/add/{petId}", consumes = "multipart/form-data")
    public ResponseEntity<MedicalHistoryResponseDto> addMedicalHistory(
            Authentication authentication,
            @PathVariable Long petId,
            @Valid @ModelAttribute MedicalHistoryRequestDto request) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(medicalHistoryService.addMedicalHistory(petId, loggedInUserId, request));
    }

    @Operation(summary = "Get medical history records for a pet owned by logged-in user")
    @GetMapping("/pet/{petId}")
    public ResponseEntity<List<MedicalHistoryResponseDto>> getPetMedicalHistory(
            Authentication authentication,
            @PathVariable Long petId,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(medicalHistoryService.getPetMedicalHistory(petId, loggedInUserId, offset, limit));
    }

    @Operation(summary = "Update medical history record owned by logged-in user")
    @PatchMapping(value = "/Edit/{medicalHistoryId}", consumes = "multipart/form-data")
    public ResponseEntity<MedicalHistoryResponseDto> updateMedicalHistory(
            Authentication authentication,
            @PathVariable Long medicalHistoryId,
            @Valid @ModelAttribute MedicalHistoryRequestDto request) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(
                medicalHistoryService.updateMedicalHistory(medicalHistoryId, loggedInUserId, request)
        );
    }

    @Operation(summary = "Delete medical history record owned by logged-in user")
    @DeleteMapping("/delete/{medicalHistoryId}")
    public ResponseEntity<String> deleteMedicalHistory(
            Authentication authentication,
            @PathVariable Long medicalHistoryId) {
        Long loggedInUserId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(medicalHistoryService.deleteMedicalHistory(medicalHistoryId, loggedInUserId));
    }

    @InitBinder
    public void initBinder(WebDataBinder binder) {
        binder.registerCustomEditor(MultipartFile.class, "prescriptionFile", new java.beans.PropertyEditorSupport() {
            @Override
            public void setAsText(String text) {
                setValue(null);
            }
        });
    }
}
