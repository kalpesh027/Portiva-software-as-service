package com.portiva.backend.repository;

import com.portiva.backend.entity.Portfolio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PortfolioRepository extends JpaRepository<Portfolio, UUID> {

    /**
     * User's own portfolio — excludes soft-deleted.
     * Unique per user, but returns Optional to handle 'not yet created' case.
     */
    Optional<Portfolio> findByUserIdAndDeletedAtIsNull(UUID userId);

    /**
     * Public portfolio lookup by slug — excludes soft-deleted.
     * Cached in Redis — see PortfolioService.getPublic().
     */
    Optional<Portfolio> findBySlugAndDeletedAtIsNull(String slug);

    /**
     * Custom domain lookup — for /portfolio/by-domain endpoint.
     */
    Optional<Portfolio> findByCustomDomainAndDeletedAtIsNull(String customDomain);

    /**
     * AI polling task — find all portfolios still being generated.
     * Only returns non-deleted portfolios.
     */
    List<Portfolio> findAllByAiStatusInAndDeletedAtIsNull(List<String> statuses);

    /**
     * Admin — pageable list of all portfolios including soft-deleted for audit.
     */
    Page<Portfolio> findAll(Pageable pageable);

    /**
     * Admin — count of published portfolios.
     */
    long countByStatusAndDeletedAtIsNull(String status);

    /**
     * Admin — total portfolio count excluding soft-deleted.
     */
    long countByDeletedAtIsNull();
}
