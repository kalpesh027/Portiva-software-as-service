package com.portiva.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class CreateOrderResponse {
    private String orderId;
    private Long amount;       // INR paise
    private String currency;   // always "INR"
    private String keyId;      // Razorpay public key — safe to expose to frontend
}
