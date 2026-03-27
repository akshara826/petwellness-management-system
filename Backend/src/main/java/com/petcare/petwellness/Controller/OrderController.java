package com.petcare.petwellness.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.OrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.RazorpayPaymentVerifyRequestDto;
import com.petcare.petwellness.DTO.Response.OrderResponseDto;
import com.petcare.petwellness.DTO.Response.RazorpayOrderResponseDto;
import com.petcare.petwellness.Service.OrderService;
import com.petcare.petwellness.Util.AuthenticatedUserUtil;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final AuthenticatedUserUtil authenticatedUserUtil;

    public OrderController(OrderService orderService,
                           AuthenticatedUserUtil authenticatedUserUtil) {
        this.orderService = orderService;
        this.authenticatedUserUtil = authenticatedUserUtil;
    }

    @GetMapping("/my")
    public ResponseEntity<List<OrderResponseDto>> getMyOrders(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.getMyOrders(userId, offset, limit));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrderById(
            Authentication authentication,
            @PathVariable Long orderId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.getOrderById(userId, orderId));
    }

    @PostMapping("/{orderId}/confirm-payment")
    public ResponseEntity<OrderResponseDto> confirmPayment(
            Authentication authentication,
            @PathVariable Long orderId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.confirmPayment(userId, orderId));
    }

    @PostMapping("/{orderId}/razorpay-order")
    public ResponseEntity<RazorpayOrderResponseDto> createRazorpayOrder(
            Authentication authentication,
            @PathVariable Long orderId) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.createRazorpayOrder(userId, orderId));
    }

    @PostMapping("/{orderId}/verify-payment")
    public ResponseEntity<OrderResponseDto> verifyRazorpayPayment(
            Authentication authentication,
            @PathVariable Long orderId,
            @Valid @RequestBody RazorpayPaymentVerifyRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.verifyRazorpayPayment(userId, orderId, request));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            Authentication authentication,
            @PathVariable Long orderId,
            @Valid @RequestBody(required = false) OrderCancelRequestDto request) {
        Long userId = authenticatedUserUtil.resolveCurrentUserId(authentication);
        return ResponseEntity.ok(orderService.cancelOrder(userId, orderId, request));
    }
}
