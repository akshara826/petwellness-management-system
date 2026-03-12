package com.petcare.petwellness.Service.Notification;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import com.petcare.petwellness.Events.OrderStatusChangeSource;
import com.petcare.petwellness.Events.OrderStatusChangedEvent;
import com.petcare.petwellness.Enums.OrderStatus;
import com.petcare.petwellness.Service.EmailService;

@Component
public class OrderEmailNotificationListener {

    private static final Logger LOGGER = LoggerFactory.getLogger(OrderEmailNotificationListener.class);

    private final EmailService emailService;
    private final boolean enabled;

    public OrderEmailNotificationListener(
            EmailService emailService,
            @Value("${orders.email-notifications.enabled:true}") boolean enabled) {
        this.emailService = emailService;
        this.enabled = enabled;
    }

    @Async("emailTaskExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderStatusChanged(OrderStatusChangedEvent event) {
        if (!enabled || event == null) {
            return;
        }

        OrderStatus newStatus = event.getNewStatus();
        if (newStatus == null) {
            return;
        }

        if (!shouldNotify(event)) {
            return;
        }

        String to = trimToNull(event.getRecipientEmail());
        if (to == null) {
            return;
        }

        String subject = buildSubject(event);
        String body = buildBody(event);

        try {
            emailService.sendEmail(to, subject, body);
        } catch (Exception ex) {
            LOGGER.warn("Failed to send order status email for order {} to {}: {}", event.getOrderId(), to, ex.getMessage());
        }
    }

    private boolean shouldNotify(OrderStatusChangedEvent event) {
        OrderStatus status = event.getNewStatus();
        if (status == OrderStatus.PAID
                || status == OrderStatus.PROCESSING
                || status == OrderStatus.SHIPPED
                || status == OrderStatus.DELIVERED) {
            return true;
        }

        if (status == OrderStatus.CANCELLED && event.getSource() == OrderStatusChangeSource.ADMIN) {
            return true;
        }

        return false;
    }

    private String buildSubject(OrderStatusChangedEvent event) {
        OrderStatus status = event.getNewStatus();
        String product = trimToNull(event.getProductSummary());

        if (status == OrderStatus.PAID) {
            return product != null ? "Order confirmed: " + product : "Order confirmed";
        }
        if (status == OrderStatus.CANCELLED) {
            return product != null ? "Order cancelled: " + product : "Order cancelled";
        }
        return product != null
                ? "Order update (" + status + "): " + product
                : "Order status updated: " + status;
    }

    private String buildBody(OrderStatusChangedEvent event) {
        StringBuilder body = new StringBuilder();
        String product = trimToNull(event.getProductSummary());

        body.append("Hello,\n\n");
        if (event.getNewStatus() == OrderStatus.PAID) {
            body.append("Your order");
            if (product != null) {
                body.append(" for ").append(product);
            }
            body.append(" is confirmed.\n");
            body.append("We have received your order.\n");
        } else {
            body.append("Your order");
            if (product != null) {
                body.append(" for ").append(product);
            }
            body.append(" status is now ").append(event.getNewStatus()).append(".\n");
        }

        if (event.getNewStatus() == OrderStatus.PAID) {
            if (event.getTotalAmount() != null) {
                body.append("Total amount: ").append(event.getTotalAmount()).append("\n");
            }
            String address = trimToNull(event.getShippingAddress());
            String pincode = trimToNull(event.getShippingPincode());
            if (address != null || pincode != null) {
                body.append("\nShipping address:\n");
                if (address != null) {
                    body.append(address).append("\n");
                }
                if (pincode != null) {
                    body.append("Pincode: ").append(pincode).append("\n");
                }
            }
        }

        if (event.getNewStatus() == OrderStatus.CANCELLED && event.getSource() == OrderStatusChangeSource.ADMIN) {
            String reason = trimToNull(event.getCancelReason());
            body.append("\nCancellation reason: ").append(reason != null ? reason : "No reason provided").append("\n");
        }

        body.append("\nThank you,\nPetWellness\n");
        return body.toString();
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
