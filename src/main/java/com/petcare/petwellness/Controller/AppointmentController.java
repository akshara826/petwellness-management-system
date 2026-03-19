package com.petcare.petwellness.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.AppointmentBookRequestDto;
import com.petcare.petwellness.DTO.Response.AppointmentResponseDto;
import com.petcare.petwellness.Service.AppointmentService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
@SecurityRequirement(name = "bearerAuth")
public class AppointmentController {

    private final AppointmentService appointmentService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public AppointmentController(AppointmentService appointmentService, AuthenticatedUserUtil authenticatedUserUtil) {
        this.appointmentService = appointmentService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @PostMapping("/{appointmentId}/book")
    public ResponseEntity<AppointmentResponseDto> bookAppointment(
            Authentication authentication,
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentBookRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(
                appointmentService.bookAppointment(appointmentId, request.getPetId(), userId)
        );
    }

    @PostMapping("/{appointmentId}/cancel")
    public ResponseEntity<AppointmentResponseDto> cancelAppointment(
            Authentication authentication,
            @PathVariable Long appointmentId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(appointmentService.cancelAppointment(appointmentId, userId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<AppointmentResponseDto>> getAvailableAppointments(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(appointmentService.getAvailableAppointments(offset, limit));
    }

    @GetMapping("/my")
    public ResponseEntity<List<AppointmentResponseDto>> getMyBookedAppointments(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(appointmentService.getUserBookedAppointments(userId, offset, limit));
    }
}
