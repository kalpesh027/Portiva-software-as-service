package com.portiva.backend.dto.payment;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Plan info for the public pricing page.
 * Currency always INR for Portiva.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanResponse {
    private String id;
    private String name;
    private Long price;          // in INR paise
    private String currency;     // always "INR"
    private String billingPeriod;
    private List<String> features;
}
