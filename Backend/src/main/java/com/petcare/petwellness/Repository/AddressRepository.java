package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;


public interface AddressRepository extends JpaRepository<Address, Long> {
    void deleteByUserId(Long userId);
    Optional<Address> findByUserId(Long userId);
}
