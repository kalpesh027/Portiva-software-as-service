package com.portiva.backend.repository;

import com.portiva.backend.entity.PaymentOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentOrderRepository extends JpaRepository<PaymentOrder, UUID> {

    /**
     * Idempotency check — find existing order before creating a new one.
     * Also used during webhook processing to find the relevant order.
     */
    Optional<PaymentOrder> findByRazorpayOrderId(String razorpayOrderId);

    /**
     * User's payment history — descending by created_at (index covers this).
     */
    List<PaymentOrder> findByUserIdOrderByCreatedAtDesc(UUID userId);

    /**
     * Total revenue — sum of paid orders in paise. Divide by 100 for INR.
     */
    @Query("SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po WHERE po.status = 'paid'")
    Long sumPaidAmounts();

    /**
     * Monthly revenue — current calendar month, in paise.
     * Uses @Param startOfMonth so the caller provides the window boundary.
     * Avoids non-standard YEAR()/MONTH() HQL functions.
     */
    @Query("""
           SELECT COALESCE(SUM(po.amount), 0) FROM PaymentOrder po
           WHERE po.status = 'paid'
             AND po.createdAt >= :startOfMonth
           """)
    Long sumPaidAmountsThisMonth(@Param("startOfMonth") java.time.LocalDateTime startOfMonth);
}
