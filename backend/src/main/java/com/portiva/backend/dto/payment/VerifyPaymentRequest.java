package com.portiva.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyPaymentRequest {

    @NotBlank(message = "Razorpay order ID is required")
    private String razorpay_order_id;

    @NotBlank(message = "Razorpay payment ID is required")
    private String razorpay_payment_id;

    @NotBlank(message = "Razorpay signature is required")
    private String razorpay_signature;
}
