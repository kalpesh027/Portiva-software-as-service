package com.portiva.backend.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.github.bucket4j.*;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

/**
 * Rate limiting filter — Bucket4j token-bucket algorithm, Redis-backed.
 *
 * WHY REDIS:
 * - Works across multiple app instances (horizontal scaling).
 * - Buckets survive app restarts.
 * - Single source of truth for counts.
 *
 * This filter is NOT a @Component to prevent Spring Boot auto-registering it
 * as a plain servlet filter. It is registered INSIDE the Spring Security
 * filter chain (after JwtAuthFilter) by SecurityConfig, so that the
 * SecurityContext is already populated and per-user limits work correctly.
 *
 * Limits:
 *   POST /auth/register      — 10 req/hour per IP
 *   POST /auth/verify-otp    — 5 req/hour per IP
 *   POST /auth/resend-otp    — 3 req/hour per IP
 *   POST /portfolio/generate — 3 req/day  per authenticated user (or IP)
 *   All others               — 100 req/min per user (or IP)
 */
@Slf4j
public class RateLimitFilter extends OncePerRequestFilter {

    /**
     * Redis-backed ProxyManager — each bucket key maps to a Redis entry.
     * All instances read/write the same bucket, so totals are global.
     */
        private final ProxyManager<byte[]> proxyManager;
        private final ConcurrentMap<String, Bucket> localBuckets = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${rate-limit.register-per-hour:10}")
    private int registerPerHour;

    @Value("${rate-limit.otp-per-hour:5}")
    private int otpPerHour;

    @Value("${rate-limit.generate-per-day:3}")
    private int generatePerDay;

    @Value("${rate-limit.default-per-minute:100}")
    private int defaultPerMinute;

    public RateLimitFilter(ProxyManager<byte[]> proxyManager) {
        this.proxyManager = proxyManager;
    }

        public RateLimitFilter() {
                this.proxyManager = null;
        }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String clientKey = resolveClientKey(request);

        Bucket bucket = resolveBucket(path, method, clientKey);

        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);

        if (probe.isConsumed()) {
            // Inform client how many tokens remain in current window
            response.addHeader("X-Rate-Limit-Remaining",
                    String.valueOf(probe.getRemainingTokens()));
            filterChain.doFilter(request, response);
        } else {
            long waitSeconds = probe.getNanosToWaitForRefill() / 1_000_000_000;
            log.warn("Rate limit exceeded: path={} key={} waitSeconds={}",
                    path, clientKey, waitSeconds);
            rejectRequest(response, waitSeconds);
        }
    }

    /**
     * Resolve the correct Redis-backed bucket for the request.
     *
     * KEY FORMAT: "rl:{route}:{clientKey}" — e.g. "rl:register:ip:1.2.3.4"
     * This namespacing prevents collisions between different limit rules.
     */
    private Bucket resolveBucket(String path, String method, String clientKey) {
        final String bucketKey;
                final Bandwidth bandwidth;

        if ("POST".equalsIgnoreCase(method) && path.contains("/auth/register")) {
            bucketKey = "rl:register:" + clientKey;
            bandwidth = Bandwidth.builder()
                    .capacity(registerPerHour)
                    .refillGreedy(registerPerHour, Duration.ofHours(1))
                    .build();

        } else if ("POST".equalsIgnoreCase(method) && path.contains("/auth/verify-otp")) {
            bucketKey = "rl:verify-otp:" + clientKey;
            bandwidth = Bandwidth.builder()
                    .capacity(otpPerHour)
                    .refillGreedy(otpPerHour, Duration.ofHours(1))
                    .build();

        } else if ("POST".equalsIgnoreCase(method) && path.contains("/auth/resend-otp")) {
            bucketKey = "rl:resend-otp:" + clientKey;
            bandwidth = Bandwidth.builder()
                    .capacity(3)
                    .refillGreedy(3, Duration.ofHours(1))
                    .build();

        } else if ("POST".equalsIgnoreCase(method) && path.contains("/portfolio/generate")) {
            // Per-USER daily limit — key includes userId when authenticated
            bucketKey = "rl:generate:" + clientKey;
            bandwidth = Bandwidth.builder()
                    .capacity(generatePerDay)
                    .refillGreedy(generatePerDay, Duration.ofDays(1))
                    .build();

        } else {
            bucketKey = "rl:default:" + clientKey;
            bandwidth = Bandwidth.builder()
                    .capacity(defaultPerMinute)
                    .refillGreedy(defaultPerMinute, Duration.ofMinutes(1))
                    .build();
        }

        if (proxyManager == null) {
            // Local mode for dev: per-instance, in-memory buckets.
            return localBuckets.computeIfAbsent(
                    bucketKey,
                    key -> Bucket.builder().addLimit(bandwidth).build()
            );
        }

        // proxyManager.builder().build() fetches the existing Redis bucket or creates it.
        // The config supplier is called lazily only if the key doesn't exist in Redis.
        final BucketConfiguration config = BucketConfiguration.builder()
                .addLimit(bandwidth)
                .build();
        return proxyManager.builder().build(
                bucketKey.getBytes(StandardCharsets.UTF_8),
                () -> config
        );
    }

    /**
     * Client identity — userId for authenticated requests, IP for anonymous.
     * This filter runs AFTER JwtAuthFilter inside the Spring Security chain,
     * so SecurityContextHolder is already populated for authenticated users.
     * Per-user limits are therefore accurate even across multiple instances.
     */
    private String resolveClientKey(HttpServletRequest request) {
        var auth = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()
                && auth.getPrincipal() instanceof java.util.UUID) {
            return "user:" + auth.getPrincipal().toString();
        }

        // Anonymous — fall back to IP; respect reverse-proxy X-Forwarded-For
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return "ip:" + forwarded.split(",")[0].trim();
        }
        return "ip:" + request.getRemoteAddr();
    }

    private void rejectRequest(HttpServletResponse response, long retryAfterSeconds)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        // RFC 7231 Retry-After header — client knows when to retry
        response.addHeader("Retry-After", String.valueOf(retryAfterSeconds));

        Map<String, Object> body = Map.of(
                "status", 429,
                "message", "Too many requests. Please slow down.",
                "retryAfterSeconds", retryAfterSeconds
        );
        objectMapper.writeValue(response.getOutputStream(), body);
    }
}
