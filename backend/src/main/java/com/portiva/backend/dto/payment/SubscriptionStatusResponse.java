package com.portiva.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SubscriptionStatusResponse {
    private String plan;
    private String status;
    private String expiresAt;
    private Boolean autoRenew;
}
