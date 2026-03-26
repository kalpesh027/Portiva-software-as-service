package com.portiva.backend.controller;

import com.portiva.backend.dto.payment.*;
import com.portiva.backend.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * Payment controller — /payment/** (authenticated)
 *
 * POST /payment/create-order — create Razorpay order (idempotent)
 * POST /payment/verify       — verify payment signature + activate subscription
 */
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;

    /**
     * POST /payment/create-order
     * Creates a Razorpay order. Amount determined by plan + billingPeriod.
     * Returns Razorpay orderId + keyId for frontend Razorpay SDK.
     */
    @PostMapping("/create-order")
    public ResponseEntity<CreateOrderResponse> createOrder(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody CreateOrderRequest req
    ) {
        return ResponseEntity.ok(
                razorpayService.createOrder(userId, req.getPlan(), req.getBillingPeriod()));
    }

    /**
     * POST /payment/verify
     * Verifies HMAC-SHA256 signature from Razorpay.
     * Activates subscription on success.
     */
    @PostMapping("/verify")
    public ResponseEntity<VerifyPaymentResponse> verifyPayment(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody VerifyPaymentRequest req
    ) {
        return ResponseEntity.ok(razorpayService.verifyPayment(
                userId,
                req.getRazorpay_order_id(),
                req.getRazorpay_payment_id(),
                req.getRazorpay_signature()
        ));
    }
}
