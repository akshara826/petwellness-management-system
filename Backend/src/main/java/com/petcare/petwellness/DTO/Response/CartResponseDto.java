package com.petcare.petwellness.DTO.Response;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CartResponseDto {

    private List<CartItemResponseDto> items = new ArrayList<>();
    private BigDecimal totalAmount = BigDecimal.ZERO;

    public List<CartItemResponseDto> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponseDto> items) {
        this.items = items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
