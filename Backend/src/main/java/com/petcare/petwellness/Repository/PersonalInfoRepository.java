package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import org.springframework.data.jpa.repository.JpaRepository;


public interface PersonalInfoRepository extends JpaRepository<PersonalInfo, Long> {
}
