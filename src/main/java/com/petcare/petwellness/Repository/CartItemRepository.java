package com.petcare.petwellness.Repository;

import java.util.List;
import java.util.Optional;

import java.math.BigDecimal;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.petcare.petwellness.Domain.Entity.CartItem;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);

    Page<CartItem> findByCartId(Long cartId, Pageable pageable);

    @Query("select sum(p.price * ci.quantity) from CartItem ci join ci.product p where ci.cart.id = :cartId")
    BigDecimal sumCartTotal(@Param("cartId") Long cartId);

    Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId);

    void deleteByCartId(Long cartId);
}
