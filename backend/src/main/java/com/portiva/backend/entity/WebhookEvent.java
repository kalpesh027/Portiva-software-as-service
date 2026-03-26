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
 * Webhook events — idempotency guard for Razorpay webhook retries.
 *
 * Before processing any webhook, check existsByEventId(eventId).
 * If exists: return immediately — already processed.
 * If not: save first, then process.
 *
 * event_id is the Razorpay X-Razorpay-Event-Id header value.
 * UNIQUE constraint makes this race-condition safe.
 */
@Entity
@Table(
    name = "webhook_events",
    indexes = {
        @Index(name = "idx_webhook_events_event_id", columnList = "event_id")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebhookEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    /**
     * Razorpay event ID — from X-Razorpay-Event-Id header.
     * UNIQUE — guarantees each event processed exactly once.
     */
    @Column(name = "event_id", unique = true, nullable = false)
    private String eventId;

    @Column(name = "event_type", length = 50)
    private String eventType;

    @CreationTimestamp
    @Column(name = "processed_at", updatable = false)
    private LocalDateTime processedAt;
}
