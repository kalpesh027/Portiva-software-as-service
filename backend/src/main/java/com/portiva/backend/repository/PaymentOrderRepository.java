package com.portiva.backend.repository;

import com.portiva.backend.entity.PaymentOrder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

    /**
     * Admin payment list with optional filters and fuzzy search.
     * Uses native SQL with explicit TEXT casts so search remains safe even if
     * older databases still have Razorpay ID columns as bytea.
     */
    @Query(
            value = """
                    SELECT po.*
                    FROM payment_orders po
                    JOIN users u ON u.id = po.user_id
                    WHERE (:status IS NULL OR po.status = :status)
                      AND (:plan IS NULL OR po.plan = :plan)
                      AND (
                        :search IS NULL OR
                        LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(CAST(po.razorpay_order_id AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(CAST(po.razorpay_payment_id AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%'))
                      )
                    ORDER BY po.created_at DESC
                    """,
            countQuery = """
                    SELECT COUNT(*)
                    FROM payment_orders po
                    JOIN users u ON u.id = po.user_id
                    WHERE (:status IS NULL OR po.status = :status)
                      AND (:plan IS NULL OR po.plan = :plan)
                      AND (
                        :search IS NULL OR
                        LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(CAST(po.razorpay_order_id AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%')) OR
                        LOWER(CAST(po.razorpay_payment_id AS TEXT)) LIKE LOWER(CONCAT('%', :search, '%'))
                      )
                    """,
            nativeQuery = true
    )
    Page<PaymentOrder> searchForAdmin(
            @Param("status") String status,
            @Param("plan") String plan,
            @Param("search") String search,
            Pageable pageable
    );
}
