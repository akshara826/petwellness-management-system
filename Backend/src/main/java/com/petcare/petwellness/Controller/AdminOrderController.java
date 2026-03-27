package com.petcare.petwellness.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.petcare.petwellness.DTO.Request.AdminOrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.OrderStatusUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.OrderResponseDto;
import com.petcare.petwellness.Enums.OrderStatus;
import com.petcare.petwellness.Service.OrderService;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/orders")
@SecurityRequirement(name = "bearerAuth")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponseDto>> getOrders(
            @RequestParam(defaultValue = "0") int offset,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getAllOrders(offset, limit, status));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponseDto> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderByIdForAdmin(orderId));
    }

    @PatchMapping("/{orderId}/status")
    public ResponseEntity<OrderResponseDto> updateStatus(
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequestDto request) {
        return ResponseEntity.ok(orderService.updateOrderStatus(orderId, request));
    }

    @PostMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponseDto> cancelOrder(
            @PathVariable Long orderId,
            @Valid @RequestBody AdminOrderCancelRequestDto request) {
        return ResponseEntity.ok(orderService.cancelOrderByAdmin(orderId, request));
    }
}
