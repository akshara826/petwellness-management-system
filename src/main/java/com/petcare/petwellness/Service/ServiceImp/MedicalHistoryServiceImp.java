package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.MedicalHistoryRequestDto;
import com.petcare.petwellness.DTO.Response.MedicalHistoryResponseDto;
import com.petcare.petwellness.Domain.Entity.MedicalHistory;
import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.MedicalHistoryRepository;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Service.MedicalHistoryService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class MedicalHistoryServiceImp implements MedicalHistoryService {

    private final MedicalHistoryRepository medicalHistoryRepository;
    private final PetRepository petRepository;
    private final FileStorageUtil fileStorageUtil;

    public MedicalHistoryServiceImp(MedicalHistoryRepository medicalHistoryRepository,
                                    PetRepository petRepository,
                                    FileStorageUtil fileStorageUtil) {
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.petRepository = petRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional
    public MedicalHistoryResponseDto addMedicalHistory(Long petId, Long loggedInUserId, MedicalHistoryRequestDto request) {
        Pet pet = getOwnedPetOrThrow(petId, loggedInUserId);

        MedicalHistory medicalHistory = new MedicalHistory();
        medicalHistory.setPet(pet);
        medicalHistory.setVisitDate(request.getVisitDate());
        medicalHistory.setDoctorName(request.getDoctorName().trim());
        medicalHistory.setClinicName(trimToNull(request.getClinicName()));
        medicalHistory.setSymptoms(trimToNull(request.getSymptoms()));
        medicalHistory.setDiagnosis(request.getDiagnosis().trim());
        medicalHistory.setTreatment(trimToNull(request.getTreatment()));
        medicalHistory.setMedication(trimToNull(request.getMedication()));
        medicalHistory.setWeight(request.getWeight());
        medicalHistory.setNextVisitDate(request.getNextVisitDate());

        if (request.getPrescriptionFile() != null && !request.getPrescriptionFile().isEmpty()) {
            medicalHistory.setPrescriptionFile(savePrescription(request.getPrescriptionFile()));
        }

        MedicalHistory saved = medicalHistoryRepository.save(medicalHistory);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicalHistoryResponseDto> getPetMedicalHistory(Long petId, Long loggedInUserId, int offset, int limit) {
        validatePagination(offset, limit);
        getOwnedPetOrThrow(petId, loggedInUserId);
        PageRequest pageable = PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "visitDate"));
        return medicalHistoryRepository.findByPetId(petId, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public MedicalHistoryResponseDto updateMedicalHistory(Long medicalHistoryId, Long loggedInUserId, MedicalHistoryRequestDto request) {
        MedicalHistory medicalHistory = getOwnedMedicalHistoryOrThrow(medicalHistoryId, loggedInUserId);

        medicalHistory.setVisitDate(request.getVisitDate());
        medicalHistory.setDoctorName(request.getDoctorName().trim());
        medicalHistory.setClinicName(trimToNull(request.getClinicName()));
        medicalHistory.setSymptoms(trimToNull(request.getSymptoms()));
        medicalHistory.setDiagnosis(request.getDiagnosis().trim());
        medicalHistory.setTreatment(trimToNull(request.getTreatment()));
        medicalHistory.setMedication(trimToNull(request.getMedication()));
        medicalHistory.setWeight(request.getWeight());
        medicalHistory.setNextVisitDate(request.getNextVisitDate());

        MultipartFile prescriptionFile = request.getPrescriptionFile();
        if (prescriptionFile != null && !prescriptionFile.isEmpty()) {
            String oldPath = medicalHistory.getPrescriptionFile();
            medicalHistory.setPrescriptionFile(savePrescription(prescriptionFile));
            fileStorageUtil.deleteFileQuietly(oldPath);
        }

        MedicalHistory saved = medicalHistoryRepository.save(medicalHistory);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public String deleteMedicalHistory(Long medicalHistoryId, Long loggedInUserId) {
        MedicalHistory medicalHistory = getOwnedMedicalHistoryOrThrow(medicalHistoryId, loggedInUserId);
        fileStorageUtil.deleteFileQuietly(medicalHistory.getPrescriptionFile());
        medicalHistoryRepository.delete(medicalHistory);
        return "Medical history deleted successfully";
    }

    private Pet getOwnedPetOrThrow(Long petId, Long loggedInUserId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        Long ownerId = pet.getUser() != null ? pet.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to access this pet medical history");
        }

        return pet;
    }

    private MedicalHistory getOwnedMedicalHistoryOrThrow(Long medicalHistoryId, Long loggedInUserId) {
        MedicalHistory medicalHistory = medicalHistoryRepository.findById(medicalHistoryId)
                .orElseThrow(() -> new ResourceNotFoundException("Medical history not found"));

        Long ownerId = medicalHistory.getPet() != null && medicalHistory.getPet().getUser() != null
                ? medicalHistory.getPet().getUser().getId()
                : null;

        if (ownerId == null || !ownerId.equals(loggedInUserId)) {
            throw new UnauthorizedException("You are not authorized to access this medical history");
        }

        return medicalHistory;
    }

    private String savePrescription(MultipartFile prescriptionFile) {
        try {
            return fileStorageUtil.saveFile(prescriptionFile, "prescriptions");
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

    private MedicalHistoryResponseDto mapToDto(MedicalHistory medicalHistory) {
        MedicalHistoryResponseDto dto = new MedicalHistoryResponseDto();
        dto.setId(medicalHistory.getId());
        dto.setPetId(medicalHistory.getPet().getId());
        dto.setVisitDate(medicalHistory.getVisitDate());
        dto.setDoctorName(medicalHistory.getDoctorName());
        dto.setClinicName(medicalHistory.getClinicName());
        dto.setSymptoms(medicalHistory.getSymptoms());
        dto.setDiagnosis(medicalHistory.getDiagnosis());
        dto.setTreatment(medicalHistory.getTreatment());
        dto.setMedication(medicalHistory.getMedication());
        dto.setWeight(medicalHistory.getWeight());
        dto.setPrescriptionFile(medicalHistory.getPrescriptionFile());
        dto.setNextVisitDate(medicalHistory.getNextVisitDate());
        dto.setCreatedAt(medicalHistory.getCreatedAt());
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
