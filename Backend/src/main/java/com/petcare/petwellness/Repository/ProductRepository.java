package com.petcare.petwellness.Repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Enums.ProductCategory;
import com.petcare.petwellness.Enums.ProductStatus;

public interface ProductRepository extends JpaRepository<Product, Long> {

    Page<Product> findByStatusIn(List<ProductStatus> statuses, Pageable pageable);

    Page<Product> findByStatusInAndCategory(List<ProductStatus> statuses, ProductCategory category, Pageable pageable);

    Page<Product> findByCategory(ProductCategory category, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select p from Product p where p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);
}
