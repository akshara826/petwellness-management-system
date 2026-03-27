package com.petcare.petwellness.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.AppointmentCreateRequestDto;
import com.petcare.petwellness.DTO.Request.AppointmentUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.AppointmentResponseDto;
import com.petcare.petwellness.Service.AppointmentService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/appointments")
@SecurityRequirement(name = "bearerAuth")
public class AdminAppointmentController {

    private final AppointmentService appointmentService;

    public AdminAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @PostMapping("/create")
    public ResponseEntity<AppointmentResponseDto> createAppointment(
            @Valid @RequestBody AppointmentCreateRequestDto request) {
        return ResponseEntity.ok(appointmentService.createAppointment(request));
    }

    @PatchMapping("/update/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> updateAppointment(
            @PathVariable Long appointmentId,
            @Valid @RequestBody AppointmentUpdateRequestDto request) {
        return ResponseEntity.ok(appointmentService.updateAppointment(appointmentId, request));
    }

    @GetMapping("/{appointmentId}")
    public ResponseEntity<AppointmentResponseDto> getAppointmentById(
            @PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.getAppointmentById(appointmentId));
    }

    @GetMapping("/all")
    public ResponseEntity<List<AppointmentResponseDto>> getAppointments(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(appointmentService.getAppointments(offset, limit));
    }

    @GetMapping("/booked")
    public ResponseEntity<List<AppointmentResponseDto>> getBookedAppointments(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(appointmentService.getBookedAppointments(offset, limit));
    }

    @DeleteMapping("/delete/{appointmentId}")
    public ResponseEntity<String> deleteAppointment(@PathVariable Long appointmentId) {
        return ResponseEntity.ok(appointmentService.deleteAppointment(appointmentId));
    }
}
