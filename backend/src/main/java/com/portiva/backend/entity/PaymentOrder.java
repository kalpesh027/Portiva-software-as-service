package com.portiva.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Payment orders — immutable audit log of every Razorpay order.
 *
 * razorpay_order_id is the idempotency key — UNIQUE constraint prevents
 * duplicate order records even on webhook retry.
 *
 * webhook_processed flag prevents processing duplicate webhook events.
 */
@Entity
@Table(
    name = "payment_orders",
    indexes = {
        @Index(name = "idx_payment_orders_uid", columnList = "user_id, created_at DESC"),
        @Index(name = "idx_payment_orders_rzp_order", columnList = "razorpay_order_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Razorpay order ID — serves as idempotency key.
     * UNIQUE — prevents duplicate payment_order rows.
     */
    @Column(name = "razorpay_order_id", unique = true)
    private String razorpayOrderId;

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_signature")
    private String razorpaySignature;

    @Column(name = "plan", length = 20)
    private String plan;

    @Column(name = "billing_period", length = 20)
    private String billingPeriod;

    /**
     * Amount in INR paise. 1 INR = 100 paise.
     * e.g. 99900 = ₹999
     */
    @Column(name = "amount")
    private Long amount;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "INR";

    /**
     * Status: 'created' | 'paid' | 'failed'
     */
    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "created";

    /**
     * Prevents processing duplicate webhook events for this order.
     */
    @Column(name = "webhook_processed", nullable = false)
    @Builder.Default
    private Boolean webhookProcessed = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
