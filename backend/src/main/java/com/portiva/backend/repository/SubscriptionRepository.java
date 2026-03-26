package com.portiva.backend.repository;

import com.portiva.backend.entity.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    /**
     * Fetch a user's subscription — used everywhere subscription status is needed.
     */
    Optional<Subscription> findByUserId(UUID userId);

    /**
     * Count active subscriptions for a given plan — used by AdminService.getStats().
     * Replaces the previous findAll().stream().filter() pattern (O(n) → O(1) DB query).
     */
    @Query("SELECT COUNT(s) FROM Subscription s WHERE s.plan = :plan AND s.status = 'active'")
    long countActivePlan(@Param("plan") String plan);
}
