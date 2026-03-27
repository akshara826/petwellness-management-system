package com.petcare.petwellness.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.CartItemAddRequestDto;
import com.petcare.petwellness.DTO.Request.CartItemUpdateRequestDto;
import com.petcare.petwellness.DTO.Request.CheckoutRequestDto;
import com.petcare.petwellness.DTO.Response.CartResponseDto;
import com.petcare.petwellness.DTO.Response.OrderResponseDto;
import com.petcare.petwellness.Service.CartService;
import com.petcare.petwellness.Service.OrderService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cart")
@SecurityRequirement(name = "bearerAuth")
public class CartController {

    private final CartService cartService;
    private final OrderService orderService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public CartController(CartService cartService,
                          OrderService orderService,
                          AuthenticatedUserUtil authenticatedUserUtil) {
        this.cartService = cartService;
        this.orderService = orderService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @GetMapping
    public ResponseEntity<CartResponseDto> getCart(Authentication authentication) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.getCart(userId));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponseDto> addItem(
            Authentication authentication,
            @Valid @RequestBody CartItemAddRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.addItem(userId, request));
    }

    @PatchMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDto> updateItem(
            Authentication authentication,
            @PathVariable Long itemId,
            @Valid @RequestBody CartItemUpdateRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.updateItem(userId, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponseDto> removeItem(
            Authentication authentication,
            @PathVariable Long itemId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(cartService.removeItem(userId, itemId));
    }

    @PostMapping("/checkout")
    public ResponseEntity<OrderResponseDto> checkout(
            Authentication authentication,
            @Valid @RequestBody CheckoutRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.checkout(userId, request));
    }
}
