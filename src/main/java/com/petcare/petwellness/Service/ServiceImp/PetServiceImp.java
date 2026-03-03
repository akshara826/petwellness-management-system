package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.PetRequestDto;
import com.petcare.petwellness.DTO.Request.PetUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.PetResponseDto;
import com.petcare.petwellness.Domain.Entity.MedicalHistory;
import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Domain.Entity.Vaccination;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.PetLimitExceededException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.MedicalHistoryRepository;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Repository.VaccinationRepository;
import com.petcare.petwellness.Service.PetService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class PetServiceImp implements PetService {

    private static final long MAX_PET_IMAGE_BYTES = 10L * 1024 * 1024;
    private static final Set<String> ALLOWED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
            "application/pdf",
            "application/x-pdf"
    );

    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final MedicalHistoryRepository medicalHistoryRepository;
    private final VaccinationRepository vaccinationRepository;
    private final FileStorageUtil fileStorageUtil;

    public PetServiceImp(PetRepository petRepository,
                         UserRepository userRepository,
                         MedicalHistoryRepository medicalHistoryRepository,
                         VaccinationRepository vaccinationRepository,
                         FileStorageUtil fileStorageUtil) {
        this.petRepository = petRepository;
        this.userRepository = userRepository;
        this.medicalHistoryRepository = medicalHistoryRepository;
        this.vaccinationRepository = vaccinationRepository;
        this.fileStorageUtil = fileStorageUtil;
    }

    @Override
    @Transactional
    public PetResponseDto addPet(PetRequestDto request, Long userId) {
        String petName = request.getName().trim();
        String species = request.getSpecies().trim();
        String breed = request.getBreed() == null ? null : request.getBreed().trim();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long petCount = petRepository.countByUserId(userId);
        if (petCount >= 5) {
            throw new PetLimitExceededException("You can add maximum 5 pets only.");
        }

        boolean exists = petRepository.existsByNameAndUserId(petName, userId);
        if (exists) {
            throw new BadRequestException("Pet with this name already exists for this user.");
        }

        Pet pet = new Pet();
        pet.setName(petName);
        pet.setSpecies(species);
        pet.setBreed(breed);
        pet.setGender(request.getGender());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setWeight(request.getWeight());
        pet.setUser(user);

        if (request.getImage() == null || request.getImage().isEmpty()) {
            throw new BadRequestException("Pet image is required.");
        }
        validatePetImage(request.getImage());
        String imagePath = saveImage(request.getImage());
        pet.setPetImage(imagePath);

        Pet savedPet = petRepository.save(pet);
        return mapToDto(savedPet);
    }

    @Override
    @Transactional
    public PetResponseDto updatePet(Long petId, PetUpdateRequestDto request, Long userId) {
        Pet pet = getOwnedPetOrThrow(petId, userId);

        String petName = request.getName().trim();
        if (petRepository.existsByNameAndUserIdAndIdNot(petName, userId, petId)) {
            throw new BadRequestException("Pet with this name already exists for this user.");
        }

        pet.setName(petName);
        pet.setSpecies(request.getSpecies().trim());
        pet.setBreed(trimToNull(request.getBreed()));
        pet.setGender(request.getGender());
        pet.setDateOfBirth(request.getDateOfBirth());
        pet.setWeight(request.getWeight());

        MultipartFile image = request.getImage();
        if (image != null && !image.isEmpty()) {
            validatePetImage(image);
            String oldImagePath = pet.getPetImage();
            pet.setPetImage(saveImage(image));
            fileStorageUtil.deleteFileQuietly(oldImagePath);
        }

        Pet savedPet = petRepository.save(pet);
        return mapToDto(savedPet);
    }

    @Override
    @Transactional
    public String deletePet(Long petId, Long userId) {
        Pet pet = getOwnedPetOrThrow(petId, userId);

        List<MedicalHistory> medicalHistories = medicalHistoryRepository.findByPetId(petId);
        for (MedicalHistory history : medicalHistories) {
            fileStorageUtil.deleteFileQuietly(history.getPrescriptionFile());
        }

        List<Vaccination> vaccinations = vaccinationRepository.findByPetId(petId);
        for (Vaccination vaccination : vaccinations) {
            fileStorageUtil.deleteFileQuietly(vaccination.getPrescriptionFile());
        }

        medicalHistoryRepository.deleteByPetId(petId);
        vaccinationRepository.deleteByPetId(petId);
        fileStorageUtil.deleteFileQuietly(pet.getPetImage());
        petRepository.delete(pet);

        return "Pet deleted successfully";
    }

    @Override
    @Transactional(readOnly = true)
    public List<PetResponseDto> getUserPets(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found");
        }

        List<Pet> pets = petRepository.findByUserId(userId);
        return pets.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    private Pet getOwnedPetOrThrow(Long petId, Long userId) {
        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        Long ownerId = pet.getUser() != null ? pet.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            throw new UnauthorizedException("You are not authorized to access this pet");
        }

        return pet;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private String saveImage(MultipartFile file) {
        try {
            return fileStorageUtil.saveFile(file, "pet-images");
        } catch (RuntimeException ex) {
            throw new BadRequestException("Pet image upload failed: " + ex.getMessage());
        }
    }

    private void validatePetImage(MultipartFile image) {
        String contentType = image.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid pet image type. Allowed: jpg, jpeg, png, pdf, webp");
        }

        if (image.getSize() > MAX_PET_IMAGE_BYTES) {
            throw new BadRequestException("Pet image size must be <= 10MB");
        }
    }

    private PetResponseDto mapToDto(Pet pet) {
        PetResponseDto dto = new PetResponseDto();
        dto.setId(pet.getId());
        dto.setName(pet.getName());
        dto.setSpecies(pet.getSpecies());
        dto.setBreed(pet.getBreed());
        dto.setGender(pet.getGender());
        dto.setWeight(pet.getWeight());
        dto.setCreatedAt(pet.getCreatedAt());
        dto.setImageUrl(pet.getPetImage());
        return dto;
    }
}
