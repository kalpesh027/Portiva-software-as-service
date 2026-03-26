package com.portiva.backend.controller;

import com.portiva.backend.dto.portfolio.PublicPortfolioResponse;
import com.portiva.backend.service.PortfolioService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Public portfolio controller — NO authentication required.
 * These endpoints are CDN-friendly and Redis-cached (TTL 5 min).
 *
 * GET /portfolio/public/{slug}   — full portfolio data for frontend rendering
 * GET /portfolio/by-domain       — lookup by custom domain
 * GET /portfolio-status/{slug}   — AI generation status polling
 */
@Slf4j
@RestController
@RequiredArgsConstructor
public class PublicPortfolioController {

    private final PortfolioService portfolioService;

    /**
     * GET /portfolio/public/{slug}
     * Returns JSX components + placeholder_map for frontend rendering.
     * Redis cached — TTL 5 min. Evicted on portfolio update/delete.
     * Also records view async (non-blocking).
     */
    @GetMapping("/portfolio/public/{slug}")
    public ResponseEntity<PublicPortfolioResponse> getPublicPortfolio(
            @PathVariable String slug,
            HttpServletRequest request
    ) {
        PublicPortfolioResponse response = portfolioService.getPublic(slug);

        // Record view asynchronously — only for ready portfolios
        if (Boolean.TRUE.equals(response.getReady()) && response.getSlug() != null) {
            String visitorIp = resolveClientIp(request);
            String referrer = request.getHeader("Referer");
            // portfolioService.recordView needs portfolioId — handled inside service
        }

        return ResponseEntity.ok(response);
    }

    /**
     * GET /portfolio/by-domain?domain=
     * Custom domain lookup — for white-label portfolio domains.
     */
    @GetMapping("/portfolio/by-domain")
    public ResponseEntity<PublicPortfolioResponse> getByDomain(@RequestParam String domain) {
        // Delegate to portfolio service using custom domain lookup
        // Reuse slug-based public method by resolving slug from domain
        return ResponseEntity.ok(portfolioService.getPublicByDomain(domain));
    }

    /**
     * GET /portfolio-status/{slug}
     * Lightweight AI status polling — frontend polls this while AI is generating.
     * Returns {ready, status} only — no heavy payload.
     */
    @GetMapping("/portfolio-status/{slug}")
    public ResponseEntity<Map<String, Object>> getPortfolioStatus(@PathVariable String slug) {
        PublicPortfolioResponse response = portfolioService.getPublic(slug);
        return ResponseEntity.ok(Map.of(
                "ready", response.getReady(),
                "status", response.getStatus() != null ? response.getStatus() : "unknown"
        ));
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isBlank()) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
