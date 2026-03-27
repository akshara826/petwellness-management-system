package com.petcare.petwellness.Service;

import java.util.List;

import com.petcare.petwellness.DTO.Request.AdminOrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.CheckoutRequestDto;
import com.petcare.petwellness.DTO.Request.OrderCancelRequestDto;
import com.petcare.petwellness.DTO.Request.OrderStatusUpdateRequestDto;
import com.petcare.petwellness.DTO.Request.RazorpayPaymentVerifyRequestDto;
import com.petcare.petwellness.DTO.Response.OrderResponseDto;
import com.petcare.petwellness.DTO.Response.RazorpayOrderResponseDto;
import com.petcare.petwellness.Enums.OrderStatus;

public interface OrderService {

    OrderResponseDto checkout(Long userId, CheckoutRequestDto request);

    OrderResponseDto confirmPayment(Long userId, Long orderId);

    OrderResponseDto cancelOrder(Long userId, Long orderId, OrderCancelRequestDto request);

    List<OrderResponseDto> getMyOrders(Long userId, int offset, int limit);

    OrderResponseDto getOrderById(Long userId, Long orderId);

    RazorpayOrderResponseDto createRazorpayOrder(Long userId, Long orderId);

    OrderResponseDto verifyRazorpayPayment(Long userId, Long orderId, RazorpayPaymentVerifyRequestDto request);

    void reconcilePendingPayments(int batchSize, java.time.LocalDateTime cutoff);

    List<OrderResponseDto> getAllOrders(int offset, int limit, OrderStatus status);

    OrderResponseDto getOrderByIdForAdmin(Long orderId);

    OrderResponseDto updateOrderStatus(Long orderId, OrderStatusUpdateRequestDto request);

    OrderResponseDto cancelOrderByAdmin(Long orderId, AdminOrderCancelRequestDto request);
}
