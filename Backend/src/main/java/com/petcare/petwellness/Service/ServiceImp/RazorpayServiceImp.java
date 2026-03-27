package com.petcare.petwellness.Service.ServiceImp;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.petcare.petwellness.DTO.Request.RazorpayPaymentVerifyRequestDto;
import com.petcare.petwellness.DTO.Response.RazorpayOrderResponseDto;
import com.petcare.petwellness.Domain.Entity.Order;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Service.RazorpayService;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@Service
public class RazorpayServiceImp implements RazorpayService {

    private final String keyId;
    private final String keySecret;
    private final String apiBase;
    private final HttpClient httpClient;
    public RazorpayServiceImp(
            @Value("${razorpay.key-id}") String keyId,
            @Value("${razorpay.key-secret}") String keySecret,
            @Value("${razorpay.api-base:https://api.razorpay.com/v1}") String apiBase) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.apiBase = apiBase;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(5))
                .build();
    }

    @Override
    public RazorpayOrderResponseDto createRazorpayOrder(Order order) {
        validateKeys();

        long amountInPaise = toPaise(order.getTotalAmount());

        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountInPaise);
            options.put("currency", "INR");
            options.put("receipt", "order_" + order.getId());

            com.razorpay.Order razorpayOrder = client.orders.create(options);
            String razorpayOrderId = razorpayOrder.get("id");

            RazorpayOrderResponseDto response = new RazorpayOrderResponseDto();
            response.setOrderId(order.getId());
            response.setRazorpayOrderId(razorpayOrderId);
            response.setKeyId(keyId);
            response.setAmount(amountInPaise);
            response.setCurrency("INR");
            return response;
        } catch (RazorpayException ex) {
            throw new BadRequestException("Failed to create Razorpay order: " + ex.getMessage());
        }
    }

    @Override
    public RazorpayOrderResponseDto buildResponse(Order order) {
        validateKeys();

        if (order.getRazorpayOrderId() == null || order.getRazorpayOrderId().isBlank()) {
            throw new BadRequestException("Razorpay order id is missing");
        }

        RazorpayOrderResponseDto response = new RazorpayOrderResponseDto();
        response.setOrderId(order.getId());
        response.setRazorpayOrderId(order.getRazorpayOrderId());
        response.setKeyId(keyId);
        response.setAmount(toPaise(order.getTotalAmount()));
        response.setCurrency("INR");
        return response;
    }

    @Override
    public boolean verifyPaymentSignature(RazorpayPaymentVerifyRequestDto request) {
        validateKeys();

        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", request.getRazorpayOrderId());
            options.put("razorpay_payment_id", request.getRazorpayPaymentId());
            options.put("razorpay_signature", request.getRazorpaySignature());
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException ex) {
            return false;
        }
    }

    @Override
    public String findCapturedPaymentId(String razorpayOrderId) {
        validateKeys();

        if (razorpayOrderId == null || razorpayOrderId.isBlank()) {
            return null;
        }

        try {
            String credentials = keyId + ":" + keySecret;
            String auth = Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
            String url = apiBase + "/orders/" + razorpayOrderId + "/payments";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Authorization", "Basic " + auth)
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != 200) {
                return null;
            }

            JSONObject body = new JSONObject(response.body());
            if (!body.has("items")) {
                return null;
            }

            for (Object item : body.getJSONArray("items")) {
                if (!(item instanceof JSONObject)) {
                    continue;
                }
                JSONObject payment = (JSONObject) item;
                String status = payment.optString("status", "");
                if ("captured".equalsIgnoreCase(status)) {
                    String paymentId = payment.optString("id", null);
                    return paymentId != null && !paymentId.isBlank() ? paymentId : null;
                }
            }
        } catch (Exception ex) {
            return null;
        }

        return null;
    }

    private long toPaise(BigDecimal amount) {
        if (amount == null) {
            throw new BadRequestException("Order total amount is missing");
        }
        BigDecimal normalized = amount.setScale(2, RoundingMode.HALF_UP);
        return normalized.movePointRight(2).longValueExact();
    }

    private void validateKeys() {
        if (keyId == null || keyId.isBlank() || keySecret == null || keySecret.isBlank()) {
            throw new BadRequestException("Razorpay keys are not configured");
        }
    }
}
