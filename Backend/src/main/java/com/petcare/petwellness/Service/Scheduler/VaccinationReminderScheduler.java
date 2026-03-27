package com.petcare.petwellness.Service.Scheduler;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.petcare.petwellness.Service.VaccinationReminderService;

@Service
public class VaccinationReminderScheduler {

    private final VaccinationReminderService vaccinationReminderService;

    public VaccinationReminderScheduler(VaccinationReminderService vaccinationReminderService) {
        this.vaccinationReminderService = vaccinationReminderService;
    }

    @Scheduled(cron = "${vaccination.reminder.cron:0 0 9 * * ?}")
    public void processVaccinationReminders() {
        vaccinationReminderService.sendDueDateReminders();
    }
}
