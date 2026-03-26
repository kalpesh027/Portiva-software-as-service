package com.portiva.backend.service;

import com.portiva.backend.dto.payment.*;
import com.portiva.backend.entity.PaymentOrder;
import com.portiva.backend.entity.Subscription;
import com.portiva.backend.entity.User;
import com.portiva.backend.entity.WebhookEvent;
import com.portiva.backend.exception.ForbiddenException;
import com.portiva.backend.exception.ResourceNotFoundException;
import com.portiva.backend.exception.UnauthorizedException;
import com.portiva.backend.repository.PaymentOrderRepository;
import com.portiva.backend.repository.SubscriptionRepository;
import com.portiva.backend.repository.UserRepository;
import com.portiva.backend.repository.WebhookEventRepository;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HexFormat;
import java.util.Map;
import java.util.UUID;

/**
 * Razorpay payment service.
 *
 * IDEMPOTENCY:
 * - razorpay_order_id is the idempotency key — UNIQUE in payment_orders.
 * - Webhook handler checks WebhookEvent table before processing.
 * - Duplicate webhooks are silently ignored.
 *
 * SECURITY:
 * - All signature verifications use HMAC-SHA256.
 * - Amounts always in INR paise — never in rupees.
 * - Webhook secret separate from API key secret.
 */
@Slf4j
@Service
public class RazorpayService {

    private final RazorpayClient razorpayClient;
    private final PaymentOrderRepository paymentOrderRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final WebhookEventRepository webhookEventRepository;

    @Value("${razorpay.key-id}")
    private String keyId;

    @Value("${razorpay.key-secret}")
    private String keySecret;

    @Value("${razorpay.webhook-secret}")
    private String webhookSecret;

    @Value("${razorpay.pro-monthly-amount}")
    private long proMonthlyAmount;

    @Value("${razorpay.pro-yearly-amount}")
    private long proYearlyAmount;

    @Value("${razorpay.team-monthly-amount}")
    private long teamMonthlyAmount;

    @Value("${razorpay.team-yearly-amount}")
    private long teamYearlyAmount;

    public RazorpayService(
            RazorpayClient razorpayClient,
            PaymentOrderRepository paymentOrderRepository,
            SubscriptionRepository subscriptionRepository,
            UserRepository userRepository,
            WebhookEventRepository webhookEventRepository
    ) {
        this.razorpayClient = razorpayClient;
        this.paymentOrderRepository = paymentOrderRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.webhookEventRepository = webhookEventRepository;
    }

    /**
     * Create Razorpay order — idempotent by razorpay_order_id.
     * Amount always in INR paise.
     */
    @Transactional
    public CreateOrderResponse createOrder(UUID userId, String plan, String billingPeriod) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        long amount = resolveAmount(plan, billingPeriod);

        try {
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amount);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "portiva_" + userId + "_" + System.currentTimeMillis());
            orderRequest.put("notes", new JSONObject()
                    .put("userId", userId.toString())
                    .put("plan", plan)
                    .put("billingPeriod", billingPeriod));

            Order razorpayOrder = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = razorpayOrder.get("id");

            // Persist for audit and idempotency
            PaymentOrder paymentOrder = PaymentOrder.builder()
                    .user(user)
                    .razorpayOrderId(razorpayOrderId)
                    .plan(plan)
                    .billingPeriod(billingPeriod)
                    .amount(amount)
                    .currency("INR")
                    .status("created")
                    .webhookProcessed(false)
                    .build();

            paymentOrderRepository.save(paymentOrder);

            log.info("Payment order created: userId={} orderId={} amount={} plan={}",
                    userId, razorpayOrderId, amount, plan);

            return new CreateOrderResponse(razorpayOrderId, amount, "INR", keyId);

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed: userId={} plan={} error={}",
                    userId, plan, e.getMessage());
            throw new RuntimeException("Payment service unavailable. Please try again.");
        }
    }

    /**
     * Verify payment signature — HMAC-SHA256(orderId|paymentId, keySecret).
     * Activates subscription on success.
     */
    @Transactional
    public VerifyPaymentResponse verifyPayment(
            UUID userId,
            String razorpayOrderId,
            String razorpayPaymentId,
            String razorpaySignature
    ) {
        // Verify HMAC signature
        String expectedSignature = computeHmac(
                razorpayOrderId + "|" + razorpayPaymentId,
                keySecret
        );

        if (!expectedSignature.equals(razorpaySignature)) {
            log.warn("Payment signature mismatch: userId={} orderId={}", userId, razorpayOrderId);
            throw new UnauthorizedException("Payment verification failed");
        }

        // Update payment order
        PaymentOrder paymentOrder = paymentOrderRepository
                .findByRazorpayOrderId(razorpayOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));

        paymentOrder.setRazorpayPaymentId(razorpayPaymentId);
        paymentOrder.setRazorpaySignature(razorpaySignature);
        paymentOrder.setStatus("paid");
        paymentOrderRepository.save(paymentOrder);

        // Activate subscription
        Subscription sub = activateSubscription(
                userId,
                paymentOrder.getPlan(),
                paymentOrder.getBillingPeriod(),
                razorpayPaymentId,
                razorpayOrderId
        );

        log.info("Payment verified: userId={} orderId={} plan={}", userId, razorpayOrderId, sub.getPlan());

        return new VerifyPaymentResponse(
                true,
                Map.of("plan", sub.getPlan(), "status", sub.getStatus())
        );
    }

    /**
     * Handle Razorpay webhook — idempotent.
     *
     * FLOW:
     * 1. Verify HMAC signature of raw payload.
     * 2. Check if eventId already processed — return if so (idempotent).
     * 3. Save WebhookEvent first.
     * 4. Process event.
     */
    @Transactional
    public void handleWebhook(String payload, String signature, String eventId) {
        // 1. Verify signature
        String expectedSig = computeHmac(payload, webhookSecret);
        if (!expectedSig.equals(signature)) {
            log.warn("Webhook signature verification failed: eventId={}", eventId);
            throw new UnauthorizedException("Invalid webhook signature");
        }

        // 2. Idempotency check — already processed?
        if (webhookEventRepository.existsByEventId(eventId)) {
            log.info("Webhook already processed — skipping: eventId={}", eventId);
            return;
        }

        // 3. Parse event
        JSONObject event = new JSONObject(payload);
        String eventType = event.optString("event");

        // 4. Save webhook event record FIRST (idempotency guard)
        webhookEventRepository.save(WebhookEvent.builder()
                .eventId(eventId)
                .eventType(eventType)
                .build());

        // 5. Process by event type
        try {
            switch (eventType) {
                case "payment.captured" -> handlePaymentCaptured(event);
                case "payment.failed" -> handlePaymentFailed(event);
                case "subscription.cancelled" -> handleSubscriptionCancelled(event);
                default -> log.info("Unhandled webhook event type: {}", eventType);
            }
        } catch (Exception e) {
            log.error("Webhook processing error: eventId={} type={} error={}",
                    eventId, eventType, e.getMessage());
            // Do not rethrow — webhook already saved, return 200 to Razorpay
        }
    }

    public SubscriptionStatusResponse getSubscriptionStatus(UUID userId) {
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        return new SubscriptionStatusResponse(
                sub.getPlan(),
                sub.getStatus(),
                sub.getExpiresAt() != null ? sub.getExpiresAt().toString() : null,
                sub.getAutoRenew()
        );
    }

    @Transactional
    public Map<String, String> cancelSubscription(UUID userId) {
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Subscription not found"));

        sub.setAutoRenew(false);
        sub.setCancelledAt(LocalDateTime.now());
        sub.setStatus("cancelled");
        subscriptionRepository.save(sub);

        log.info("Subscription cancelled: userId={}", userId);

        return Map.of(
                "message", "Subscription cancelled. You retain access until expiry.",
                "cancelledAt", sub.getCancelledAt().toString()
        );
    }

    // ===== PRIVATE HELPERS =====

    private void handlePaymentCaptured(JSONObject event) {
        JSONObject paymentEntity = event
                .getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String razorpayOrderId = paymentEntity.optString("order_id");
        String razorpayPaymentId = paymentEntity.optString("id");

        paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            if (!"paid".equals(order.getStatus())) {
                order.setStatus("paid");
                order.setRazorpayPaymentId(razorpayPaymentId);
                order.setWebhookProcessed(true);
                paymentOrderRepository.save(order);

                activateSubscription(
                        order.getUser().getId(),
                        order.getPlan(),
                        order.getBillingPeriod(),
                        razorpayPaymentId,
                        razorpayOrderId
                );
                log.info("Subscription activated via webhook: orderId={}", razorpayOrderId);
            }
        });
    }

    private void handlePaymentFailed(JSONObject event) {
        JSONObject paymentEntity = event
                .getJSONObject("payload")
                .getJSONObject("payment")
                .getJSONObject("entity");

        String razorpayOrderId = paymentEntity.optString("order_id");

        paymentOrderRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(order -> {
            order.setStatus("failed");
            order.setWebhookProcessed(true);
            paymentOrderRepository.save(order);

            subscriptionRepository.findByUserId(order.getUser().getId()).ifPresent(sub -> {
                if (!"active".equals(sub.getStatus())) {
                    sub.setStatus("inactive");
                    subscriptionRepository.save(sub);
                }
            });

            log.info("Payment failed recorded: orderId={}", razorpayOrderId);
        });
    }

    private void handleSubscriptionCancelled(JSONObject event) {
        // Extract user via notes.userId if available
        try {
            JSONObject notes = event
                    .getJSONObject("payload")
                    .getJSONObject("subscription")
                    .getJSONObject("entity")
                    .optJSONObject("notes");

            if (notes != null && notes.has("userId")) {
                UUID userId = UUID.fromString(notes.getString("userId"));
                subscriptionRepository.findByUserId(userId).ifPresent(sub -> {
                    sub.setPlan("free");
                    sub.setStatus("inactive");
                    sub.setCancelledAt(LocalDateTime.now());
                    subscriptionRepository.save(sub);
                    log.info("Subscription cancelled via webhook: userId={}", userId);
                });
            }
        } catch (Exception e) {
            log.warn("Could not process subscription.cancelled webhook: {}", e.getMessage());
        }
    }

    private Subscription activateSubscription(
            UUID userId, String plan, String billingPeriod,
            String paymentId, String orderId
    ) {
        Subscription sub = subscriptionRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    return Subscription.builder().user(user).build();
                });

        sub.setPlan(plan);
        sub.setStatus("active");
        sub.setBillingPeriod(billingPeriod);
        sub.setRazorpayPaymentId(paymentId);
        sub.setRazorpayOrderId(orderId);
        sub.setAutoRenew(true);
        sub.setCancelledAt(null);

        // Set expiry: monthly = +30 days, yearly = +365 days
        sub.setExpiresAt("yearly".equals(billingPeriod)
                ? LocalDateTime.now().plusDays(365)
                : LocalDateTime.now().plusDays(30));

        return subscriptionRepository.save(sub);
    }

    private long resolveAmount(String plan, String billingPeriod) {
        boolean yearly = "yearly".equals(billingPeriod);
        return switch (plan.toLowerCase()) {
            case "pro" -> yearly ? proYearlyAmount : proMonthlyAmount;
            case "team" -> yearly ? teamYearlyAmount : teamMonthlyAmount;
            default -> throw new ForbiddenException("Invalid plan: " + plan);
        };
    }

    private String computeHmac(String data, String secret) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(
                    secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (Exception e) {
            throw new RuntimeException("HMAC computation failed", e);
        }
    }
}
