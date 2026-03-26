package com.portiva.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

@Data
@AllArgsConstructor
public class VerifyPaymentResponse {
    private Boolean success;
    private Map<String, String> subscription; // {plan, status}
}
