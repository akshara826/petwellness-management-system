package com.petcare.petwellness.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.petcare.petwellness.Domain.Entity.Order;
import com.petcare.petwellness.Enums.OrderStatus;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserId(Long userId, Pageable pageable);

    Optional<Order> findByIdAndUserId(Long id, Long userId);

    Optional<Order> findByRazorpayOrderId(String razorpayOrderId);

    List<Order> findByStatus(OrderStatus status, Pageable pageable);

    List<Order> findByStatusAndRazorpayOrderIdIsNotNullAndCreatedAtBefore(
            OrderStatus status,
            LocalDateTime cutoff,
            Pageable pageable);
}
