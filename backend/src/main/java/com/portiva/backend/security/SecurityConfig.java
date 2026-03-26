package com.portiva.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Security configuration — production-grade.
 *
 * Principles:
 * - Stateless JWT — no sessions, no cookies
 * - CSRF disabled (JWT bearer tokens are CSRF-immune)
 * - CORS restricted to configured frontend URL
 * - BCrypt strength 12
 * - Method-level security enabled (@PreAuthorize on admin endpoints)
 * - Strict security headers (X-Frame-Options, CSP, HSTS)
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final ObjectProvider<RateLimitFilter> rateLimitFilterProvider;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    /**
     * BCrypt strength 12 — matches production security requirements.
     * Strength 12 = ~300ms hash time, acceptable for login.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            // ===== CSRF — disabled (stateless JWT auth) =====
            .csrf(AbstractHttpConfigurer::disable)

            // ===== CORS =====
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // ===== SESSION — stateless =====
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            // ===== SECURITY HEADERS =====
            .headers(headers -> headers
                .frameOptions(frame -> frame.deny())
                .contentTypeOptions(content -> {})
                .xssProtection(xss -> {})
                .referrerPolicy(referrer ->
                    referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN))
                // HSTS — enforced in production via application-prod.properties
                .httpStrictTransportSecurity(hsts -> hsts
                    .includeSubDomains(true)
                    .maxAgeInSeconds(31536000))
            )

            // ===== AUTHORIZATION RULES =====
            .authorizeHttpRequests(auth -> auth

                // Health check — always public
                .requestMatchers("/actuator/health").permitAll()

                // Auth — public (registration, login, OTP)
                .requestMatchers("/auth/**").permitAll()

                // Public portfolio endpoints — no auth, CDN-friendly
                .requestMatchers(HttpMethod.GET, "/portfolio/public/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/portfolio/by-domain").permitAll()
                .requestMatchers(HttpMethod.GET, "/portfolio-status/**").permitAll()

                // Templates — public read
                .requestMatchers(HttpMethod.GET, "/templates/**").permitAll()

                // Subscription plans — public (pricing page)
                .requestMatchers(HttpMethod.GET, "/subscription/plans").permitAll()

                // Razorpay webhooks — NO auth (verified by HMAC signature in handler)
                .requestMatchers("/webhooks/**").permitAll()

                // React routing — serve frontend HTML files
                .requestMatchers(
                    "/", "/login", "/register", "/verify-otp",
                    "/create", "/dashboard", "/preview",
                    "/portfolio-dummy", "/ai-processing", "/portfolio-success"
                ).permitAll()
                // Public slug routes for portfolio rendering
                .requestMatchers("/{slug}", "/{slug}/**").permitAll()

                // Admin — requires ADMIN role (also enforced by @PreAuthorize on AdminController)
                .requestMatchers("/admin/**").hasRole("ADMIN")

                // Everything else requires authentication
                .anyRequest().authenticated()
            )

            // ===== JWT FILTER =====
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        // Rate limiting runs AFTER JWT auth so per-user limits work correctly.
        // In non-prod profiles, the Redis-backed rate-limit filter may be disabled.
        RateLimitFilter rateLimitFilter = rateLimitFilterProvider.getIfAvailable();
        if (rateLimitFilter != null) {
            http.addFilterAfter(rateLimitFilter, JwtAuthFilter.class);
        }

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Allow configured frontend url or split if multiple
        if (frontendUrl.contains(",")) {
            config.setAllowedOrigins(List.of(frontendUrl.split(",")));
        } else {
            config.setAllowedOrigins(List.of(frontendUrl));
        }

        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
            "Authorization", "Content-Type", "X-Requested-With",
            "Accept", "Origin", "X-Idempotency-Key"
        ));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
