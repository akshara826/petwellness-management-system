package com.petcare.petwellness.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.Service.VaccinationReminderService;

import io.swagger.v3.oas.annotations.Operation;

@RestController
@RequestMapping("/api/test/reminders")
public class ReminderTestController {

    private final VaccinationReminderService vaccinationReminderService;

    public ReminderTestController(VaccinationReminderService vaccinationReminderService) {
        this.vaccinationReminderService = vaccinationReminderService;
    }

    @Operation(summary = "Trigger vaccination reminders manually for testing")
    @PostMapping("/vaccination/run")
    public ResponseEntity<String> runVaccinationReminders() {
        vaccinationReminderService.sendDueDateReminders();
        return ResponseEntity.ok("Vaccination reminders triggered successfully.");
    }
}
