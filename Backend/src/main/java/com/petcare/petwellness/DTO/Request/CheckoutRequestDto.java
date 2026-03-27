package com.petcare.petwellness.DTO.Request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CheckoutRequestDto {

    @NotBlank(message = "Shipping address is required")
    @Size(max = 500, message = "Shipping address must be at most 500 characters")
    private String shippingAddress;

    @NotBlank(message = "Pincode is required")
    @Pattern(regexp = "^\\d{6}$", message = "Pincode must be exactly 6 digits")
    private String pincode;

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public String getPincode() {
        return pincode;
    }

    public void setPincode(String pincode) {
        this.pincode = pincode;
    }
}

