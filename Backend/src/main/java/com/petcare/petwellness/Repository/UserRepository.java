package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    
    Optional<User> findByEmail(String email);

    
    List<User> findByProfileCompletedTrueAndApprovedFalse();

    
    List<User> findByRole(UserRole role);

    
}
