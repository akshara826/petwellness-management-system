package com.petcare.petwellness.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import com.petcare.petwellness.Domain.Entity.Pet;

public interface PetRepository extends JpaRepository<Pet,Long> {
    long countByUserId(Long userId);
    boolean existsByNameAndUserId(String name,Long userId);
    boolean existsByNameAndUserIdAndIdNot(String name, Long userId, Long id);
    List<Pet> findByUserId(Long userId);
}
