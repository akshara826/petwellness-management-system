package com.petcare.petwellness.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Repository.AppointmentRepository;

@Service
public class AppointmentMaintenanceService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AppointmentMaintenanceService.class);

    private final AppointmentRepository appointmentRepository;

    public AppointmentMaintenanceService(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Transactional
    public int invalidatePastSlots() {
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        List<AppointmentStatus> candidates = List.of(
                AppointmentStatus.AVAILABLE,
                AppointmentStatus.UNAVAILABLE
        );

        int updated = appointmentRepository.markPastSlotsInvalid(
                candidates,
                AppointmentStatus.INVALID,
                today,
                nowTime
        );

        if (updated > 0) {
            LOGGER.info("Marked {} past appointment slots as INVALID", updated);
        }
        return updated;
    }
}
