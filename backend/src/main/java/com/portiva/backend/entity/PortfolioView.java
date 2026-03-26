package com.portiva.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Portfolio views — analytics tracking.
 * Indexed on (portfolio_id, viewed_at) for time-range queries.
 */
@Entity
@Table(
    name = "portfolio_views",
    indexes = {
        @Index(name = "idx_portfolio_views_dt", columnList = "portfolio_id, viewed_at")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioView {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "portfolio_id", nullable = false)
    private Portfolio portfolio;

    @Column(name = "visitor_ip", length = 45)
    private String visitorIp;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "referrer")
    private String referrer;

    @Column(name = "viewed_at", updatable = false)
    @Builder.Default
    private LocalDateTime viewedAt = LocalDateTime.now();
}
