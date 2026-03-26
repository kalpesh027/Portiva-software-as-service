package com.portiva.backend.controller;

import com.portiva.backend.dto.payment.PlanResponse;
import com.portiva.backend.dto.payment.SubscriptionStatusResponse;
import com.portiva.backend.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Subscription controller — /subscription/**
 *
 * GET  /subscription/status  — authenticated, user's subscription
 * GET  /subscription/plans   — public, for pricing page
 * POST /subscription/cancel  — authenticated
 */
@RestController
@RequestMapping("/subscription")
@RequiredArgsConstructor
public class SubscriptionController {

    private final RazorpayService razorpayService;

    @Value("${razorpay.pro-monthly-amount}")
    private long proMonthlyAmount;

    @Value("${razorpay.pro-yearly-amount}")
    private long proYearlyAmount;

    @Value("${razorpay.team-monthly-amount}")
    private long teamMonthlyAmount;

    @Value("${razorpay.team-yearly-amount}")
    private long teamYearlyAmount;

    /** GET /subscription/status — user's current subscription */
    @GetMapping("/status")
    public ResponseEntity<SubscriptionStatusResponse> getStatus(
            @AuthenticationPrincipal UUID userId
    ) {
        return ResponseEntity.ok(razorpayService.getSubscriptionStatus(userId));
    }

    /** GET /subscription/plans — public, no auth. Used on pricing page. */
    @GetMapping("/plans")
    public ResponseEntity<Map<String, Object>> getPlans() {
        List<PlanResponse> plans = List.of(

            PlanResponse.builder()
                    .id("free")
                    .name("Free")
                    .price(0L)
                    .currency("INR")
                    .billingPeriod("monthly")
                    .features(List.of(
                            "1 portfolio",
                            "3 AI generations",
                            "Basic templates",
                            "portiva.com/slug URL"
                    ))
                    .build(),

            PlanResponse.builder()
                    .id("pro_monthly")
                    .name("Pro")
                    .price(proMonthlyAmount)
                    .currency("INR")
                    .billingPeriod("monthly")
                    .features(List.of(
                            "Unlimited AI regenerations",
                            "All premium templates",
                            "Custom domain",
                            "Advanced analytics",
                            "Priority support"
                    ))
                    .build(),

            PlanResponse.builder()
                    .id("pro_yearly")
                    .name("Pro (Yearly)")
                    .price(proYearlyAmount)
                    .currency("INR")
                    .billingPeriod("yearly")
                    .features(List.of(
                            "All Pro features",
                            "Save 2 months free"
                    ))
                    .build(),

            PlanResponse.builder()
                    .id("team_monthly")
                    .name("Team")
                    .price(teamMonthlyAmount)
                    .currency("INR")
                    .billingPeriod("monthly")
                    .features(List.of(
                            "Everything in Pro",
                            "Up to 10 team members",
                            "Team analytics dashboard",
                            "Dedicated support"
                    ))
                    .build(),

            PlanResponse.builder()
                    .id("team_yearly")
                    .name("Team (Yearly)")
                    .price(teamYearlyAmount)
                    .currency("INR")
                    .billingPeriod("yearly")
                    .features(List.of(
                            "All Team features",
                            "Save 2 months free"
                    ))
                    .build()
        );

        return ResponseEntity.ok(Map.of("plans", plans));
    }

    /** POST /subscription/cancel */
    @PostMapping("/cancel")
    public ResponseEntity<Map<String, String>> cancel(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(razorpayService.cancelSubscription(userId));
    }
}
