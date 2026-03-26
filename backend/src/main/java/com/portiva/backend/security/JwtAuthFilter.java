package com.portiva.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * JWT authentication filter — runs once per request.
 *
 * Responsibilities:
 * 1. Set MDC requestId (UUID) on every request — structured logging.
 * 2. Parse Bearer token from Authorization header.
 * 3. Validate token and set SecurityContext.
 * 4. Set MDC userId for authenticated requests.
 * 5. Clear MDC after request completes (thread pool safety).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // Always set a requestId — even for unauthenticated requests
        String requestId = UUID.randomUUID().toString().substring(0, 8);
        MDC.put("requestId", requestId);

        try {
            String token = extractBearerToken(request);

            if (token != null && jwtUtil.validateToken(token)) {
                UUID userId = jwtUtil.extractUserId(token);
                String role = jwtUtil.extractRole(token);

                // Set userId in MDC for structured logging
                MDC.put("userId", userId.toString());

                // Build authority — Spring Security expects ROLE_ prefix
                String authority = "ROLE_" + (role != null ? role.toUpperCase() : "USER");

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(
                                userId,
                                null,
                                List.of(new SimpleGrantedAuthority(authority))
                        );

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }

            filterChain.doFilter(request, response);

        } finally {
            // CRITICAL: clear MDC after every request — prevents thread pool leakage
            MDC.clear();
        }
    }

    private String extractBearerToken(HttpServletRequest request) {
        String header = request.getHeader("Authorization");
        if (StringUtils.hasText(header) && header.startsWith("Bearer ")) {
            return header.substring(7);
        }
        return null;
    }
}
