package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends JpaRepository<User, Long> {

    
    Optional<User> findByEmail(String email);

    
    List<User> findByProfileCompletedTrueAndStatus(UserStatus status);
    Page<User> findByProfileCompletedTrueAndStatus(UserStatus status, Pageable pageable);

    
    List<User> findByRole(UserRole role);

    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
    Page<User> findByRoleAndStatus(UserRole role, UserStatus status, Pageable pageable);

    
}
