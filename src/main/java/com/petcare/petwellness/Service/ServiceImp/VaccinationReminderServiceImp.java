package com.petcare.petwellness.Service.ServiceImp;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Domain.Entity.Vaccination;
import com.petcare.petwellness.Enums.VaccinationStatus;
import com.petcare.petwellness.Repository.VaccinationRepository;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Service.VaccinationReminderService;

@Service
public class VaccinationReminderServiceImp implements VaccinationReminderService {

    private static final Logger log = LoggerFactory.getLogger(VaccinationReminderServiceImp.class);
    private static final Set<VaccinationStatus> TARGET_STATUSES = Set.of(
            VaccinationStatus.UPCOMING,
            VaccinationStatus.OVERDUE
    );

    private final VaccinationRepository vaccinationRepository;
    private final EmailService emailService;
    private final String reminderZone;

    public VaccinationReminderServiceImp(VaccinationRepository vaccinationRepository,
                                         EmailService emailService,
                                         @Value("${vaccination.reminder.zone:Asia/Kolkata}") String reminderZone) {
        this.vaccinationRepository = vaccinationRepository;
        this.emailService = emailService;
        this.reminderZone = reminderZone;
    }

    @Override
    @Transactional
    public void sendDueDateReminders() {
        LocalDate today = LocalDate.now(ZoneId.of(reminderZone));
        LocalDate minDate = today.minusDays(1);
        LocalDate maxDate = today.plusDays(3);

        List<Vaccination> candidates = vaccinationRepository.findByNextDueDateBetweenAndStatusIn(
                minDate,
                maxDate,
                TARGET_STATUSES
        );

        for (Vaccination vaccination : candidates) {
            processVaccinationReminder(vaccination, today);
        }
    }

    private void processVaccinationReminder(Vaccination vaccination, LocalDate today) {
        LocalDate dueDate = vaccination.getNextDueDate();
        long daysUntilDue = ChronoUnit.DAYS.between(today, dueDate);

        if (daysUntilDue == 3 && !vaccination.isThreeDaysReminderSent()) {
            if (sendReminder(vaccination, "due in 3 days")) {
                vaccination.setThreeDaysReminderSent(true);
                vaccination.setReminderSent(true);
                vaccinationRepository.save(vaccination);
            }
            return;
        }

        if (daysUntilDue == 1 && !vaccination.isOneDaysReminderSent()) {
            if (sendReminder(vaccination, "due tomorrow")) {
                vaccination.setOneDaysReminderSent(true);
                vaccination.setReminderSent(true);
                vaccinationRepository.save(vaccination);
            }
            return;
        }

        if (daysUntilDue < 0 && !vaccination.isOverdueReminderSent()) {
            if (sendReminder(vaccination, "is overdue")) {
                vaccination.setOverdueReminderSent(true);
                vaccination.setReminderSent(true);
                vaccinationRepository.save(vaccination);
            }
        }
    }

    private boolean sendReminder(Vaccination vaccination, String timingMessage) {
        String ownerEmail = resolveOwnerEmail(vaccination);
        if (ownerEmail == null) {
            log.warn("Skipping vaccination reminder because owner email is missing. vaccinationId={}", vaccination.getId());
            return false;
        }

        String petName = resolvePetName(vaccination);
        String vaccineName = vaccination.getVaccineName();
        LocalDate dueDate = vaccination.getNextDueDate();

        String subject = "Vaccination reminder for " + petName;
        String body = "Hello,\n\n"
                + petName + "'s vaccine (" + vaccineName + ") " + timingMessage + ".\n"
                + "Next due date: " + dueDate + "\n\n"
                + "Please consult your veterinarian if needed.\n\n"
                + "Regards,\nPet Wellness Team";

        try {
            emailService.sendEmail(ownerEmail, subject, body);
            return true;
        } catch (RuntimeException ex) {
            log.error("Failed to send vaccination reminder. vaccinationId={}, email={}",
                    vaccination.getId(), ownerEmail, ex);
            return false;
        }
    }

    private String resolveOwnerEmail(Vaccination vaccination) {
        Pet pet = vaccination.getPet();
        if (pet == null) {
            return null;
        }

        User owner = pet.getUser();
        if (owner == null) {
            return null;
        }

        String email = owner.getEmail();
        if (email == null || email.isBlank()) {
            return null;
        }

        return email.trim();
    }

    private String resolvePetName(Vaccination vaccination) {
        Pet pet = vaccination.getPet();
        if (pet == null || pet.getName() == null || pet.getName().isBlank()) {
            return "Your pet";
        }
        return pet.getName().trim();
    }
}
