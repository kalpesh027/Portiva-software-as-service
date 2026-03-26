package com.portiva.backend.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.portiva.backend.security.RateLimitFilter;
import io.github.bucket4j.distributed.ExpirationAfterWriteStrategy;
import io.github.bucket4j.distributed.proxy.ProxyManager;
import io.github.bucket4j.redis.lettuce.cas.LettuceBasedProxyManager;
import io.lettuce.core.RedisClient;
import io.lettuce.core.api.StatefulRedisConnection;
import io.lettuce.core.codec.ByteArrayCodec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * Application beans configuration.
 * - RestTemplate for AI engine (5s connect / 10s read timeout).
 * - Redis cache manager (TTL 5 min for portfolio cache).
 * - Razorpay client bean.
 */
@Configuration
@EnableCaching
@Slf4j
public class AppConfig {

    @Value("${ai.engine.connect-timeout:5000}")
    private int connectTimeoutMs;

    @Value("${ai.engine.read-timeout:10000}")
    private int readTimeoutMs;

    /**
     * RestTemplate configured for AI engine calls.
     * 5s connect timeout, 10s read timeout.
     * Named 'aiRestTemplate' to distinguish from any other RestTemplate beans.
     */
    @Bean(name = "aiRestTemplate")
    public RestTemplate aiRestTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(connectTimeoutMs))
                .setReadTimeout(Duration.ofMillis(readTimeoutMs))
                .build();
    }

    /**
     * Redis Cache Manager — TTL 5 min for 'portfolio' cache.
     * Evicted when portfolio is updated or deleted.
     */
    @Bean
    public RedisCacheManager cacheManager(
            RedisConnectionFactory connectionFactory,
            ObjectMapper objectMapper
    ) {
        ObjectMapper cacheMapper = objectMapper.copy();
        cacheMapper.activateDefaultTyping(
            cacheMapper.getPolymorphicTypeValidator(),
            ObjectMapper.DefaultTyping.NON_FINAL,
            com.fasterxml.jackson.annotation.JsonTypeInfo.As.PROPERTY
        );

        GenericJackson2JsonRedisSerializer serializer = 
                new GenericJackson2JsonRedisSerializer(cacheMapper);

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration
                .defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(5))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(serializer))
                .disableCachingNullValues();

        return RedisCacheManager.builder(connectionFactory)
                .cacheDefaults(defaultConfig)
                .build();
    }

    // ===================================================================
    // Bucket4j Redis — distributed rate limiting
    // A dedicated Lettuce connection is created so we can use ByteArrayCodec
    // (required by LettuceBasedProxyManager).
    // This is separate from Spring Data Redis connection pool intentionally.
    // ===================================================================

    @Bean(destroyMethod = "shutdown")
    @ConditionalOnProperty(name = "rate-limit.backend", havingValue = "redis")
    public RedisClient bucket4jRedisClient(
            @Value("${spring.data.redis.host:localhost}") String host,
            @Value("${spring.data.redis.port:6379}") int port,
            @Value("${spring.data.redis.password:}") String password
    ) {
        String uri = (password != null && !password.isBlank())
                ? "redis://:" + password + "@" + host + ":" + port
                : "redis://" + host + ":" + port;
        return RedisClient.create(uri);
    }

    /**
     * Bucket4j distributed ProxyManager backed by Redis.
     * Buckets expire 2 hours after last write — prevents stale keys accumulating.
     * Works across multiple app instances — all share the same Redis keys.
     *
     * RESILIENCE: Retries up to 5 times with 2s backoff to handle transient Docker
     * DNS failures where the redis hostname resolves after a brief delay at startup.
     */
    @Bean
    @ConditionalOnProperty(name = "rate-limit.backend", havingValue = "redis")
    public ProxyManager<byte[]> bucket4jProxyManager(RedisClient bucket4jRedisClient) {
        StatefulRedisConnection<byte[], byte[]> connection = null;
        Exception lastEx = null;
        for (int attempt = 1; attempt <= 5; attempt++) {
            try {
                connection = bucket4jRedisClient.connect(ByteArrayCodec.INSTANCE);
                break;
            } catch (Exception e) {
                lastEx = e;
                log.warn("Bucket4j Redis connection attempt {}/5 failed: {}", attempt, e.getMessage());
                if (attempt < 5) {
                    try { Thread.sleep(2000L * attempt); }
                    catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
                }
            }
        }
        if (connection == null) {
            throw new RuntimeException(
                    "Bucket4j could not connect to Redis after 5 attempts", lastEx);
        }
        return LettuceBasedProxyManager.builderFor(connection)
                .withExpirationStrategy(
                        ExpirationAfterWriteStrategy.basedOnTimeForRefillingBucketUpToMax(
                                Duration.ofHours(2)))
                .build();
    }

    /**
     * RateLimitFilter bean — NOT auto-registered as servlet filter.
     * Registered into the Spring Security filter chain by SecurityConfig
     * so it runs AFTER JwtAuthFilter and can identify users by ID.
     */
    @Bean
    @ConditionalOnProperty(name = "rate-limit.enabled", havingValue = "true", matchIfMissing = true)
    public RateLimitFilter rateLimitFilter(
            @Autowired(required = false) ProxyManager<byte[]> bucket4jProxyManager,
            @Value("${rate-limit.backend:local}") String backend
    ) {
        if (bucket4jProxyManager == null) {
            log.info("Rate limiting backend: {} (in-memory)", backend);
            return new RateLimitFilter();
        }
        log.info("Rate limiting backend: redis");
        return new RateLimitFilter(bucket4jProxyManager);
    }

    /**
     * Disable servlet auto-registration of RateLimitFilter.
     * Without this, Spring Boot would register it twice:
     * once as a servlet filter and once via SecurityConfig.
     */
    @Bean
    @ConditionalOnProperty(name = "rate-limit.enabled", havingValue = "true", matchIfMissing = true)
    public FilterRegistrationBean<RateLimitFilter> rateLimitFilterRegistration(
            RateLimitFilter rateLimitFilter) {
        FilterRegistrationBean<RateLimitFilter> registration =
                new FilterRegistrationBean<>(rateLimitFilter);
        registration.setEnabled(false);
        return registration;
    }
}
