package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.MedicalHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalHistoryRepository extends JpaRepository<MedicalHistory, Long> {
    List<MedicalHistory> findByPetId(Long petId);
    List<MedicalHistory> findByPetIdOrderByVisitDateDesc(Long petId);
    Page<MedicalHistory> findByPetId(Long petId, Pageable pageable);
    Optional <MedicalHistory>findTopByPet_IdOrderByCreatedAtDesc(Long petId);
    long deleteByPetId(Long petId);
}
