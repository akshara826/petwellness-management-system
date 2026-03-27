package com.petcare.petwellness.DTO.Request;

import com.petcare.petwellness.Enums.OrderStatus;

import jakarta.validation.constraints.NotNull;

public class OrderStatusUpdateRequestDto {

    @NotNull
    private OrderStatus status;

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }
}
