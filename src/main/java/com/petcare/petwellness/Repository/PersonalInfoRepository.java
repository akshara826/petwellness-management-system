package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface PersonalInfoRepository extends JpaRepository<PersonalInfo, Long> {
    void deleteByUserId(Long userId);
    Optional<PersonalInfo> findByUserId(Long userId);
}
