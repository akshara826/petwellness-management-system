package com.petcare.petwellness.Controller;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Service.AdminService;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/pending-users")
    public ResponseEntity<List<PendingUserResponseDto>> getPendingUsers() {
        return ResponseEntity.ok(adminService.getPendingUsers());
    }

    @PostMapping("/approve/{userId}")
    public ResponseEntity<String> approveUser(@PathVariable Long userId) {
        return ResponseEntity.ok(adminService.approveUser(userId));
    }

    @PostMapping("/create-owner")
public ResponseEntity<String> createOwner(
        @Valid @RequestBody AdminCreateOwnerRequestDto request) {

    adminService.createOwner(request);

    return ResponseEntity.ok("Owner created successfully.");
}

}
