package com.portiva.backend.controller;

import com.portiva.backend.service.RazorpayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Webhook controller — POST /webhooks/razorpay
 *
 * SECURITY:
 * - NO JWT authentication — Razorpay calls this directly.
 * - Verified via HMAC-SHA256(rawBody, webhookSecret) before any processing.
 * - @RequestBody is raw String — do NOT use Map/JsonNode (signature would break).
 * - X-Razorpay-Event-Id used for idempotency — duplicate events silently ignored.
 *
 * RELIABILITY:
 * - Always returns 200 OK to Razorpay (even on processing errors).
 * - Returning non-200 causes Razorpay to retry — we want idempotent processing.
 */
@Slf4j
@RestController
@RequestMapping("/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final RazorpayService razorpayService;

    /**
     * POST /webhooks/razorpay
     * Raw body handling — must NOT be parsed before signature verification.
     * Signature = HMAC-SHA256(rawBody, webhookSecret)
     */
    @PostMapping("/razorpay")
    public ResponseEntity<Map<String, String>> handleRazorpayWebhook(
            @RequestBody String payload,
            @RequestHeader(value = "X-Razorpay-Signature", required = false) String signature,
            @RequestHeader(value = "X-Razorpay-Event-Id", required = false) String eventId
    ) {
        if (signature == null || signature.isBlank()) {
            log.warn("Webhook received without signature — rejecting");
            // Return 200 to prevent Razorpay retry flood on misconfigured routes
            return ResponseEntity.ok(Map.of("status", "rejected"));
        }

        // Use fallback eventId if header missing (older Razorpay versions)
        String resolvedEventId = (eventId != null && !eventId.isBlank())
                ? eventId
                : "fallback-" + System.currentTimeMillis();

        log.info("Webhook received: eventId={}", resolvedEventId);

        try {
            razorpayService.handleWebhook(payload, signature, resolvedEventId);
        } catch (Exception e) {
            // Log but always return 200 — prevents Razorpay from retrying indefinitely
            log.error("Webhook processing failed: eventId={} error={}", resolvedEventId, e.getMessage());
        }

        return ResponseEntity.ok(Map.of("status", "received"));
    }
}
