package com.petcare.petwellness.Repository;

import com.petcare.petwellness.Domain.Entity.Address;
import org.springframework.data.jpa.repository.JpaRepository;


public interface AddressRepository extends JpaRepository<Address, Long> {
}
