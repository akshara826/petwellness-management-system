package com.petcare.petwellness.Events;

import java.math.BigDecimal;

import com.petcare.petwellness.Enums.OrderStatus;

public class OrderStatusChangedEvent {

    private final Long orderId;
    private final String productSummary;
    private final String recipientEmail;
    private final OrderStatus previousStatus;
    private final OrderStatus newStatus;
    private final OrderStatusChangeSource source;
    private final BigDecimal totalAmount;
    private final String shippingAddress;
    private final String shippingPincode;
    private final String cancelReason;

    public OrderStatusChangedEvent(
            Long orderId,
            String productSummary,
            String recipientEmail,
            OrderStatus previousStatus,
            OrderStatus newStatus,
            OrderStatusChangeSource source,
            BigDecimal totalAmount,
            String shippingAddress,
            String shippingPincode,
            String cancelReason) {
        this.orderId = orderId;
        this.productSummary = productSummary;
        this.recipientEmail = recipientEmail;
        this.previousStatus = previousStatus;
        this.newStatus = newStatus;
        this.source = source;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.shippingPincode = shippingPincode;
        this.cancelReason = cancelReason;
    }

    public Long getOrderId() {
        return orderId;
    }

    public String getProductSummary() {
        return productSummary;
    }

    public String getRecipientEmail() {
        return recipientEmail;
    }

    public OrderStatus getPreviousStatus() {
        return previousStatus;
    }

    public OrderStatus getNewStatus() {
        return newStatus;
    }

    public OrderStatusChangeSource getSource() {
        return source;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public String getShippingPincode() {
        return shippingPincode;
    }

    public String getCancelReason() {
        return cancelReason;
    }
}
