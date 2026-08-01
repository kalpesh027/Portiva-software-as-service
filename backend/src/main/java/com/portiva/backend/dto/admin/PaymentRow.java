package com.portiva.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRow {
    private String id;
    private String userId;
    private String userEmail;
    private String plan;
    private String billingPeriod;
    private Long amountPaise;
    private Double amountInr;
    private String currency;
    private String status;
    private String razorpayOrderId;
    private String razorpayPaymentId;
    private Boolean webhookProcessed;
    private String createdAt;
}
