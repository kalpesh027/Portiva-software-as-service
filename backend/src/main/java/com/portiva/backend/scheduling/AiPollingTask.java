package com.portiva.backend.scheduling;

import com.portiva.backend.entity.Portfolio;
import com.portiva.backend.repository.PortfolioRepository;
import com.portiva.backend.service.PortfolioAIService;
import com.portiva.backend.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * AI polling task — checks status of in-progress AI generations every 30 seconds.
 *
 * DESIGN:
 * - Finds all portfolios with ai_status = 'pending' | 'generating'.
 * - For each: polls AI engine checkStatus().
 * - If done: calls saveAiResult() to persist AI output and evict Redis cache.
 * - Per-portfolio exceptions are caught — one failure does NOT stop others.
 * - Structured log at the end of each cycle.
 */
@Slf4j
@Component
@EnableScheduling
@RequiredArgsConstructor
public class AiPollingTask {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioAIService aiService;
    private final PortfolioService portfolioService;

    private static final List<String> ACTIVE_STATUSES = List.of("pending", "generating");

    @Scheduled(fixedDelay = 30000) // every 30 seconds
    public void pollAiStatus() {
        List<Portfolio> pending = portfolioRepository
                .findAllByAiStatusInAndDeletedAtIsNull(ACTIVE_STATUSES);

        if (pending.isEmpty()) {
            return;
        }

        AtomicInteger completed = new AtomicInteger(0);
        int total = pending.size();

        for (Portfolio portfolio : pending) {
            try {
                String userId = portfolio.getUser().getId().toString();

                Optional<Map<String, Object>> statusOpt = aiService.checkStatus(userId);
                if (statusOpt.isEmpty()) {
                    continue;
                }

                Map<String, Object> status = statusOpt.get();
                String aiStatus = String.valueOf(status.getOrDefault("status", ""));

                if ("done".equals(aiStatus)) {
                    // AI engine returns template + placeholder_map in the status response directly
                    if (status.containsKey("template") && status.containsKey("placeholder_map")) {
                        portfolioService.saveAiResult(portfolio, status);
                        completed.incrementAndGet();
                        log.info("AI generation completed: portfolioId={} userId={}",
                                portfolio.getId(), userId);
                    } else {
                        // Fallback: fetch full portfolio data from AI engine
                        Optional<Map<String, Object>> portfolioDataOpt = aiService.getPortfolio(userId);
                        if (portfolioDataOpt.isPresent()) {
                            portfolioService.saveAiResult(portfolio, portfolioDataOpt.get());
                            completed.incrementAndGet();
                            log.info("AI generation completed (fallback): portfolioId={} userId={}",
                                    portfolio.getId(), userId);
                        } else {
                            log.warn("AI done but portfolio data unavailable: userId={}", userId);
                        }
                    }

                } else if ("generating".equals(aiStatus)) {
                    // Update status to 'generating' if still 'pending'
                    if ("pending".equals(portfolio.getAiStatus())) {
                        portfolio.setAiStatus("generating");
                        portfolioRepository.save(portfolio);
                    }
                } else if ("failed".equals(aiStatus)) {
                    portfolio.setAiStatus("failed");
                    portfolio.setStatus("failed");
                    portfolioRepository.save(portfolio);
                    log.warn("AI generation failed: portfolioId={} userId={}",
                            portfolio.getId(), userId);
                }

            } catch (Exception e) {
                // ONE portfolio failure must NOT stop others
                log.error("AI poll error for portfolioId={}: {}",
                        portfolio.getId(), e.getMessage());
            }
        }

        log.info("AI poll cycle: checked={} completed={}", total, completed.get());
    }
}
