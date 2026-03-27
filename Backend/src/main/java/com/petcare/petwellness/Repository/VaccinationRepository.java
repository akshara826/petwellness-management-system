package com.petcare.petwellness.Repository;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.petcare.petwellness.Domain.Entity.Vaccination;
import java.util.Optional;
import com.petcare.petwellness.Enums.VaccinationStatus;

public interface VaccinationRepository extends JpaRepository<Vaccination, Long> {
    List<Vaccination> findByPetId(Long petId);
    Page<Vaccination> findByPetId(Long petId, Pageable pageable);
    List<Vaccination> findByNextDueDateBetweenAndStatusIn(LocalDate startDate, LocalDate endDate,
                                                          Collection<VaccinationStatus> statuses);

       Optional<Vaccination> findTopByPet_IdOrderByCreatedAtDesc(Long petId);                                                   
    long deleteByPetId(Long petId);
}
