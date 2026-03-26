package com.portiva.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Subscriptions table — one-to-one with User.
 * Razorpay payment fields stored for audit trail.
 */
@Entity
@Table(name = "subscriptions")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subscription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", unique = true, nullable = false)
    private User user;

    /**
     * Plan: 'free' | 'pro' | 'team'
     */
    @Column(name = "plan", length = 20, nullable = false)
    @Builder.Default
    private String plan = "free";

    /**
     * Status: 'inactive' | 'active' | 'cancelled' | 'expired'
     */
    @Column(name = "status", length = 20, nullable = false)
    @Builder.Default
    private String status = "inactive";

    /**
     * Billing period: 'monthly' | 'yearly'
     */
    @Column(name = "billing_period", length = 20)
    @Builder.Default
    private String billingPeriod = "monthly";

    @Column(name = "razorpay_payment_id")
    private String razorpayPaymentId;

    @Column(name = "razorpay_order_id")
    private String razorpayOrderId;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    @Column(name = "auto_renew", nullable = false)
    @Builder.Default
    private Boolean autoRenew = true;

    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
