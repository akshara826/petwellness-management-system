package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.Domain.Entity.MedicalHistory;
import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Domain.Entity.Vaccination;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.DTO.Response.Report.HealthReportDto;
import com.petcare.petwellness.DTO.Response.Report.HealthReportPdfDto;
import com.petcare.petwellness.DTO.Response.Report.MedicalHistoryReportDto;
import com.petcare.petwellness.DTO.Response.Report.PetReportDto;
import com.petcare.petwellness.DTO.Response.Report.VaccinationReportDto;
import com.petcare.petwellness.Repository.MedicalHistoryRepository;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Repository.VaccinationRepository;
import com.petcare.petwellness.Service.HealthReportService;
import com.petcare.petwellness.Service.PdfGeneratorService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.Period;
import java.time.format.DateTimeFormatter;

@Service
public class HealthReportServiceImp implements HealthReportService {

    private final PetRepository petRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final VaccinationRepository vaccinationRepository;
    private final PdfGeneratorService pdfGeneratorService;

    public HealthReportServiceImp(
            PetRepository petRepository,
            MedicalHistoryRepository medicalHistoryRepository,
            VaccinationRepository vaccinationRepository,
            PdfGeneratorService pdfGeneratorService
    ) {
        this.petRepository = petRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.pdfGeneratorService = pdfGeneratorService;
    }

    @Override
    public HealthReportPdfDto generatePetHealthReport(Long petId, Long userId) {

        // 1) Fetch Pet
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        // 2) Ownership Validation
        if (!pet.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("You are not allowed to access this pet");
        }

        // 3) Fetch Latest Medical History
        MedicalHistory medicalHistory =
                medicalHistoryRepository
                        .findTopByPet_IdOrderByCreatedAtDesc(petId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("No medical history found. Cannot generate report."));

        // 4) Fetch Latest Vaccination
        Vaccination vaccination =
                vaccinationRepository
                        .findTopByPet_IdOrderByCreatedAtDesc(petId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("No vaccination record found. Cannot generate report."));

        // 5) Calculate Age
        Integer age = calculateAge(pet.getDateOfBirth());
        String ageDisplay = buildAgeDisplay(pet.getDateOfBirth());

        // 6) Map to DTOs
        PetReportDto petDto = new PetReportDto(
                pet.getId(),
                pet.getName(),
                pet.getSpecies(),
                pet.getBreed(),
                pet.getGender().name(),
                age,
                ageDisplay,
                pet.getWeight()
        );

        MedicalHistoryReportDto medicalDto = new MedicalHistoryReportDto(
                medicalHistory.getVisitDate(),
                medicalHistory.getDoctorName(),
                medicalHistory.getClinicName(),
                medicalHistory.getSymptoms(),
                medicalHistory.getDiagnosis(),
                medicalHistory.getTreatment(),
                medicalHistory.getMedication(),
                medicalHistory.getWeight()
        );

        VaccinationReportDto vaccinationDto = new VaccinationReportDto(
                vaccination.getVaccineName(),
                vaccination.getVaccinationDate(),
                vaccination.getNextDueDate(),
                vaccination.getDoseNumber(),
                vaccination.getVeterinarianName(),
                vaccination.getStatus().name(),
                vaccination.getNotes()
        );

        HealthReportDto reportDto = new HealthReportDto(
                petDto,
                medicalDto,
                vaccinationDto
        );

        // 7) Generate PDF and wrap response
        byte[] pdfBytes = pdfGeneratorService.generateHealthReportPdf(reportDto);
        String stamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd-HHmmss"));
        String fileName = String.format("health-report-pet-%d-%s.pdf", pet.getId(), stamp);

        return new HealthReportPdfDto(pdfBytes, fileName);
    }

    private Integer calculateAge(LocalDate dateOfBirth) {
        return Period.between(dateOfBirth, LocalDate.now()).getYears();
    }

    private String buildAgeDisplay(LocalDate dateOfBirth) {
        if (dateOfBirth == null) {
            return "-";
        }

        Period period = Period.between(dateOfBirth, LocalDate.now());
        int years = Math.max(period.getYears(), 0);
        int months = Math.max(period.getMonths(), 0);

        if (years <= 0) {
            return months + " month" + (months == 1 ? "" : "s");
        }

        if (months <= 0) {
            return years + " year" + (years == 1 ? "" : "s");
        }

        return years + " year" + (years == 1 ? "" : "s") + " " + months + " month" + (months == 1 ? "" : "s");
    }
}
