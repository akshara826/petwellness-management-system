package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.CartItemAddRequestDto;
import com.petcare.petwellness.DTO.Request.CartItemUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.CartResponseDto;

public interface CartService {

    CartResponseDto getCart(Long userId);

    CartResponseDto addItem(Long userId, CartItemAddRequestDto request);

    CartResponseDto updateItem(Long userId, Long itemId, CartItemUpdateRequestDto request);

    CartResponseDto removeItem(Long userId, Long itemId);
}
