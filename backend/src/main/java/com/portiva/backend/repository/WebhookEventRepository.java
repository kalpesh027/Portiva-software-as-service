package com.portiva.backend.repository;

import com.portiva.backend.entity.WebhookEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WebhookEventRepository extends JpaRepository<WebhookEvent, UUID> {

    /**
     * Idempotency check — MUST be called before processing any webhook event.
     * If true: event already processed → return immediately, do NOT process again.
     * Handles Razorpay retry scenarios safely.
     */
    boolean existsByEventId(String eventId);
}
