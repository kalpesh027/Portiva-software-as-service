package com.portiva.backend.repository;

import com.portiva.backend.entity.PortfolioView;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PortfolioViewRepository extends JpaRepository<PortfolioView, UUID> {

    /**
     * Total view count for a portfolio.
     */
    long countByPortfolioId(UUID portfolioId);

    /**
     * Unique visitor count by distinct IP address.
     */
    @Query("""
           SELECT COUNT(DISTINCT pv.visitorIp)
           FROM PortfolioView pv
           WHERE pv.portfolio.id = :portfolioId
           """)
    long countDistinctVisitorsByPortfolioId(@Param("portfolioId") UUID portfolioId);

    /**
     * Top 5 countries by view count — used for analytics map.
     * Returns List of Object[]{country, count}.
     */
    @Query("""
           SELECT pv.country, COUNT(pv) as cnt
           FROM PortfolioView pv
           WHERE pv.portfolio.id = :portfolioId
             AND pv.country IS NOT NULL
           GROUP BY pv.country
           ORDER BY cnt DESC
           LIMIT 5
           """)
    List<Object[]> findTop5CountriesByPortfolioId(@Param("portfolioId") UUID portfolioId);

    /**
     * Daily view counts for the last 30 days — used for timeline chart.
     * Returns List of Object[]{date, count}.
     */
    @Query("""
           SELECT CAST(pv.viewedAt AS date), COUNT(pv)
           FROM PortfolioView pv
           WHERE pv.portfolio.id = :portfolioId
             AND pv.viewedAt >= :since
           GROUP BY CAST(pv.viewedAt AS date)
           ORDER BY CAST(pv.viewedAt AS date) ASC
           """)
    List<Object[]> findDailyViewsSince(
            @Param("portfolioId") UUID portfolioId,
            @Param("since") LocalDateTime since
    );
}
