package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.RazorpayPaymentVerifyRequestDto;
import com.petcare.petwellness.DTO.Response.RazorpayOrderResponseDto;
import com.petcare.petwellness.Domain.Entity.Order;

public interface RazorpayService {

    RazorpayOrderResponseDto createRazorpayOrder(Order order);

    RazorpayOrderResponseDto buildResponse(Order order);

    boolean verifyPaymentSignature(RazorpayPaymentVerifyRequestDto request);

    String findCapturedPaymentId(String razorpayOrderId);
}
