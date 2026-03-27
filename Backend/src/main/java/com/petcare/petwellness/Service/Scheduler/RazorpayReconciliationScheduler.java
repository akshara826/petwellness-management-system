package com.petcare.petwellness.Service.Scheduler;

import java.time.LocalDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.petcare.petwellness.Service.OrderService;

@Service
public class RazorpayReconciliationScheduler {

    private final OrderService orderService;
    private final boolean enabled;
    private final int batchSize;
    private final long minAgeMinutes;

    public RazorpayReconciliationScheduler(
            OrderService orderService,
            @Value("${razorpay.reconcile.enabled:false}") boolean enabled,
            @Value("${razorpay.reconcile.batch-size:10}") int batchSize,
            @Value("${razorpay.reconcile.min-age-minutes:10}") long minAgeMinutes) {
        this.orderService = orderService;
        this.enabled = enabled;
        this.batchSize = batchSize;
        this.minAgeMinutes = minAgeMinutes;
    }

    @Scheduled(fixedDelayString = "${razorpay.reconcile.delay-ms:600000}")
    public void reconcilePendingPayments() {
        if (!enabled) {
            return;
        }

        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(minAgeMinutes);
        orderService.reconcilePendingPayments(batchSize, cutoff);
    }
}
