package com.petcare.petwellness.Service.ServiceImp;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.petcare.petwellness.DTO.Request.VaccinationRequestDto;
import com.petcare.petwellness.DTO.Response.VaccinationResponseDto;
import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Domain.Entity.Vaccination;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Repository.VaccinationRepository;
import com.petcare.petwellness.Service.VaccinationService;
import com.petcare.petwellness.Util.FileStorageUtil;

@Service
public class VaccinationServiceImp implements VaccinationService {

    private static final long MAX_PRESCRIPTION_FILE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_PRESCRIPTION_TYPES = Set.of(
            "application/pdf",
            "application/x-pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp"
    );

    private final VaccinationRepository vaccinationRepository;
    private final PetRepository petRepository;
    private final FileStorageUtil fileStorageUtil;

    public VaccinationServiceImp(VaccinationRepository vaccinationRepository,
                                 PetRepository petRepository,
                                 FileStorageUtil fileStorageUtil) {
        this.vaccinationRepository = vaccinationRepository;
        this.petRepository = petRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional
    public VaccinationResponseDto addVaccination(Long petId, Long loggedInUserId, VaccinationRequestDto request) {
        Pet pet = getOwnedPetOrThrow(petId, loggedInUserId);

        Vaccination vaccination = new Vaccination();
        vaccination.setPet(pet);
        applyRequest(vaccination, request);
        vaccination.setReminderSent(false);

        MultipartFile prescriptionFile = request.getPrescriptionFile();
        if (prescriptionFile != null && !prescriptionFile.isEmpty()) {
            validatePrescriptionFile(prescriptionFile);
            vaccination.setPrescriptionFile(savePrescription(prescriptionFile));
        }

        Vaccination saved = vaccinationRepository.save(vaccination);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public VaccinationResponseDto updateVaccination(Long vaccinationId, Long loggedInUserId, VaccinationRequestDto request) {
        Vaccination vaccination = getOwnedVaccinationOrThrow(vaccinationId, loggedInUserId);

        applyRequest(vaccination, request);

        MultipartFile prescriptionFile = request.getPrescriptionFile();
        if (prescriptionFile != null && !prescriptionFile.isEmpty()) {
            validatePrescriptionFile(prescriptionFile);
            String oldFilePath = vaccination.getPrescriptionFile();
            vaccination.setPrescriptionFile(savePrescription(prescriptionFile));
            fileStorageUtil.deleteFileQuietly(oldFilePath);
        }

        Vaccination saved = vaccinationRepository.save(vaccination);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public String deleteVaccination(Long vaccinationId, Long loggedInUserId) {
        Vaccination vaccination = getOwnedVaccinationOrThrow(vaccinationId, loggedInUserId);
        fileStorageUtil.deleteFileQuietly(vaccination.getPrescriptionFile());
        vaccinationRepository.delete(vaccination);
        return "Vaccination deleted successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public List<VaccinationResponseDto> getPetVaccinations(Long petId, Long loggedInUserId, int offset, int limit) {
        validatePagination(offset, limit);
        getOwnedPetOrThrow(petId, loggedInUserId);

        PageRequest pageable = PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "vaccinationDate"));
        return vaccinationRepository.findByPetId(petId, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    private void applyRequest(Vaccination vaccination, VaccinationRequestDto request) {
        vaccination.setVaccineName(request.getVaccineName().trim());
        vaccination.setVaccinationDate(request.getVaccinationDate());
        vaccination.setNextDueDate(request.getNextDueDate());
        vaccination.setDoseNumber(request.getDoseNumber());
        vaccination.setVeterinarianName(trimToNull(request.getVeterinarianName()));
        vaccination.setNotes(trimToNull(request.getNotes()));
    }

    private Pet getOwnedPetOrThrow(Long petId, Long loggedInUserId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        Long ownerId = pet.getUser() != null ? pet.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to access this pet vaccination data");
        }

        return pet;
    }

    private Vaccination getOwnedVaccinationOrThrow(Long vaccinationId, Long loggedInUserId) {
        Vaccination vaccination = vaccinationRepository.findById(vaccinationId)
                .orElseThrow(() -> new ResourceNotFoundException("Vaccination not found"));

        Long ownerId = vaccination.getPet() != null && vaccination.getPet().getUser() != null
                ? vaccination.getPet().getUser().getId()
                : null;

        if (ownerId == null || !ownerId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to access this vaccination record");
        }

        return vaccination;
    }

    private String savePrescription(MultipartFile prescriptionFile) {
        try {
            return fileStorageUtil.saveFile(prescriptionFile, "vaccination-prescriptions");
        } catch (RuntimeException ex) {
            throw new BadRequestException("Prescription upload failed: " + ex.getMessage());
        }
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }

        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validatePrescriptionFile(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_PRESCRIPTION_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid prescription file type. Allowed: pdf, jpg, jpeg, png, webp");
        }

        if (file.getSize() > MAX_PRESCRIPTION_FILE_BYTES) {
            throw new BadRequestException("Prescription file size must be <= 10MB");
        }
    }

    private VaccinationResponseDto mapToDto(Vaccination vaccination) {
        VaccinationResponseDto dto = new VaccinationResponseDto();
        dto.setId(vaccination.getId());
        dto.setPetId(vaccination.getPet().getId());
        dto.setVaccineName(vaccination.getVaccineName());
        dto.setVaccinationDate(vaccination.getVaccinationDate());
        dto.setNextDueDate(vaccination.getNextDueDate());
        dto.setDoseNumber(vaccination.getDoseNumber());
        dto.setVeterinarianName(vaccination.getVeterinarianName());
        dto.setStatus(vaccination.getStatus());
        dto.setNotes(vaccination.getNotes());
        dto.setReminderSent(vaccination.getReminderSent());
        dto.setPrescriptionFile(vaccination.getPrescriptionFile());
        dto.setCreatedAt(vaccination.getCreatedAt());
        return dto;
    }

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }
}
