package com.petcare.petwellness.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.petcare.petwellness.Domain.Entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {

    List<OrderItem> findByOrderId(Long orderId);
}
