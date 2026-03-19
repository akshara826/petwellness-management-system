package com.petcare.petwellness.Service.Scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.petcare.petwellness.Service.AppointmentMaintenanceService;

@Component
public class AppointmentSlotMaintenanceScheduler {

    private final AppointmentMaintenanceService maintenanceService;

    public AppointmentSlotMaintenanceScheduler(AppointmentMaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @Scheduled(fixedDelayString = "${appointments.slot-cleanup.delay-ms:10800000}")
    public void invalidatePastSlots() {
        maintenanceService.invalidatePastSlots();
    }
}
