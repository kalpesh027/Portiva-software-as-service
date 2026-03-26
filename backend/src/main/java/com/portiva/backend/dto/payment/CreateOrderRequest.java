package com.portiva.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotBlank(message = "Plan is required")
    @Pattern(regexp = "^(pro|team)$", message = "Plan must be 'pro' or 'team'")
    private String plan;

    @NotBlank(message = "Billing period is required")
    @Pattern(regexp = "^(monthly|yearly)$", message = "Billing period must be 'monthly' or 'yearly'")
    private String billingPeriod;
}
