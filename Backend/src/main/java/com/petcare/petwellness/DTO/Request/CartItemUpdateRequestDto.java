package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.PositiveOrZero;

public class CartItemUpdateRequestDto {

    @PositiveOrZero
    private Integer quantity;

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
