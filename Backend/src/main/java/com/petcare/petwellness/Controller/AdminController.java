package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Request.AdminRejectUserRequestDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardResponseDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponseDto> getDashboardOverview() {
        return ResponseEntity.ok(adminService.getDashboardOverview());
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<PendingUserResponseDto>> getPendingUsers(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getPendingUsers(offset, limit));
    }

    @GetMapping("/approved-users")
    public ResponseEntity<List<ApprovedUserResponseDto>> getApprovedUsers(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(adminService.getApprovedUsers(offset, limit));
    }

    @GetMapping("/users/{userId}/profile")
    public ResponseEntity<AdminUserProfileResponseDto> getUserProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.getUserProfile(userId));
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<String> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.approveUser(userId));
    }

    @PostMapping("/reject/{userId}")
    public ResponseEntity<String> rejectUser(
            @PathVariable Long userId,
            @Valid @RequestBody AdminRejectUserRequestDto request) {
        return ResponseEntity.ok(adminService.rejectUser(userId, request.getRejectionReason()));
    }

    @DeleteMapping("/approved-users/{userId}")
    public ResponseEntity<String> deleteApprovedUser(
            @PathVariable Long userId,
            Authentication authentication,
            @Valid @RequestBody AdminRejectUserRequestDto request) {
        return ResponseEntity.ok(
                adminService.deleteApprovedUser(
                        userId,
                        request.getRejectionReason(),
                        authentication.getName()
                )
        );
    }

    @Operation(
            summary = "Create owner profile by admin",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "multipart/form-data",
                            schema = @Schema(implementation = AdminCreateOwnerRequestDto.class)
                    )
            )
    )
    @PostMapping(value = "/create-owner", consumes = "multipart/form-data")
    public ResponseEntity<String> createOwner(
            @Valid @ModelAttribute AdminCreateOwnerRequestDto request
    ) {
        adminService.createOwner(request, request.getIdProof(), request.getProfileImage());

        return ResponseEntity.ok("Owner created successfully.");
    }

}
