package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.EmailOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;


public interface EmailOtpRepository extends JpaRepository<EmailOtp, Long> {

    
    Optional<EmailOtp> findByEmail(String email);

    
    @Transactional
    void deleteByEmail(String email);
}
