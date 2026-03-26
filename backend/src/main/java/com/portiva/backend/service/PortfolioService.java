package com.portiva.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portiva.backend.dto.portfolio.*;
import com.portiva.backend.entity.Portfolio;
import com.portiva.backend.entity.PortfolioView;
import com.portiva.backend.entity.Subscription;
import com.portiva.backend.entity.Template;
import com.portiva.backend.entity.User;
import com.portiva.backend.exception.ForbiddenException;
import com.portiva.backend.exception.ResourceNotFoundException;
import com.portiva.backend.repository.PortfolioRepository;
import com.portiva.backend.repository.PortfolioViewRepository;
import com.portiva.backend.repository.SubscriptionRepository;
import com.portiva.backend.repository.TemplateRepository;
import com.portiva.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final PortfolioRepository portfolioRepository;
    private final PortfolioViewRepository viewRepository;
    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TemplateRepository templateRepository;
    private final SlugService slugService;
    private final PortfolioAIService aiService;
    private final ObjectMapper objectMapper;
    /**
     * Spring Cache manager — injected for programmatic eviction inside non-proxied
     * private helpers. @CacheEvict on private self-called methods is bypassed by
     * Spring AOP; CacheManager.getCache().evict() always works.
     */
    private final CacheManager cacheManager;

    @Value("${app.base-url}")
    private String appBaseUrl;

    /**
     * Generate — MUST return in < 200ms.
     *
     * DESIGN:
     * - formData stored as raw JSONB — NO field hardcoding.
     * - AI triggered via @Async — does not block.
     * - Returns {portfolioId, liveUrl, templateName:'pending'} immediately.
     */
    @Transactional
    public GenerateResponse generate(UUID userId, Map<String, Object> formData) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Extract name for slug generation — safe fallback
        String name = formData.getOrDefault("name", "portfolio").toString();
        String slug = slugService.generate(name);
        String liveUrl = appBaseUrl + "/" + slug;

        // Serialize formData to JSON string for JSONB column
        String rawFormDataJson;
        try {
            rawFormDataJson = objectMapper.writeValueAsString(formData);
        } catch (Exception e) {
            log.error("Failed to serialize formData: userId={} error={}", userId, e.getMessage());
            rawFormDataJson = "{}";
        }

        // Check if user already has a portfolio — update it
        Portfolio portfolio = portfolioRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElse(null);

        if (portfolio != null) {
            // Re-generate: update existing portfolio
            portfolio.setSlug(slug);
            portfolio.setLiveUrl(liveUrl);
            portfolio.setRawFormData(rawFormDataJson);
            portfolio.setAiStatus("pending");
            portfolio.setStatus("generating");
            portfolio.setTemplateName("pending");
            portfolio.setPlaceholderMap(null);
        } else {
            portfolio = Portfolio.builder()
                    .user(user)
                    .slug(slug)
                    .liveUrl(liveUrl)
                    .rawFormData(rawFormDataJson)
                    .aiStatus("pending")
                    .status("generating")
                    .templateName("pending")
                    .build();
        }

        portfolio = portfolioRepository.save(portfolio);

        // Fire-and-forget — @Async, returns immediately
        aiService.startGeneration(userId.toString(), formData);

        log.info("Portfolio generation started: userId={} portfolioId={} slug={}",
                userId, portfolio.getId(), slug);

        return new GenerateResponse(
                portfolio.getId().toString(),
                liveUrl,
                "pending"
        );
    }

    /**
     * Save draft — persists formData + currentStep without triggering AI.
     * Called on every step advance. Idempotent: creates or updates the draft.
     * Returns portfolioId + slug so frontend can track and resume.
     */
    @Transactional
    public SaveDraftResponse saveDraft(UUID userId, Map<String, Object> formData, int currentStep) {
        User user = userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String rawFormDataJson;
        try {
            rawFormDataJson = objectMapper.writeValueAsString(formData);
        } catch (Exception e) {
            log.error("Failed to serialize formData in saveDraft: userId={}", userId);
            rawFormDataJson = "{}";
        }

        Portfolio portfolio = portfolioRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElse(null);

        if (portfolio != null) {
            // Update existing draft — only update fields that make sense for a draft
            portfolio.setRawFormData(rawFormDataJson);
            portfolio.setCurrentStep(currentStep);
            // If still a draft (not generating/done), keep it as draft
            if ("draft".equals(portfolio.getStatus())) {
                portfolio.setStatus("draft");
            }
        } else {
            // First save — generate a slug from name if present
            String name = formData.getOrDefault("name", "portfolio").toString();
            String slug = slugService.generate(name);
            portfolio = Portfolio.builder()
                    .user(user)
                    .slug(slug)
                    .liveUrl(appBaseUrl + "/" + slug)
                    .rawFormData(rawFormDataJson)
                    .aiStatus("pending")
                    .status("draft")
                    .templateName("pending")
                    .currentStep(currentStep)
                    .build();
        }

        portfolio = portfolioRepository.save(portfolio);
        log.debug("Draft saved: userId={} portfolioId={} step={}", userId, portfolio.getId(), currentStep);

        return SaveDraftResponse.builder()
                .portfolioId(portfolio.getId().toString())
                .currentStep(portfolio.getCurrentStep())
                .slug(portfolio.getSlug())
                .build();
    }

    /**
     * Slug availability check — generates the slug from a name and checks if it's taken.
     * Used by frontend to show real-time availability while user types their name.
     * Excludes the current user's own portfolio from the "taken" check.
     */
    @Transactional(readOnly = true)
    public SlugCheckResponse checkSlug(UUID userId, String name) {
        String slug = slugService.toSlugPreview(name);
        if (slug.isBlank()) {
            return new SlugCheckResponse("", false);
        }
        // Check if any OTHER user's portfolio uses this slug
        boolean taken = portfolioRepository.findBySlugAndDeletedAtIsNull(slug)
                .map(p -> !p.getUser().getId().equals(userId))
                .orElse(false);
        return new SlugCheckResponse(slug, !taken);
    }

    /**
     * Public portfolio by custom domain — delegates to getPublic() after slug lookup.
     * Called by PublicPortfolioController GET /portfolio/by-domain?domain=
     */
    @Transactional(readOnly = true)
    public PublicPortfolioResponse getPublicByDomain(String domain) {
        Portfolio portfolio = portfolioRepository.findByCustomDomainAndDeletedAtIsNull(domain)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found for domain: " + domain));
        return getPublic(portfolio.getSlug());
    }

    /**
        * Public portfolio endpoint for slug rendering.
        * Keep this path independent from Redis so local development works without it.
     * Returns JSX template components + placeholder_map for frontend rendering.
     */
    @Transactional(readOnly = true)
    @SuppressWarnings("unchecked")
    public PublicPortfolioResponse getPublic(String slug) {
        Portfolio portfolio = portfolioRepository.findBySlugAndDeletedAtIsNull(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        boolean aiDone = "done".equals(portfolio.getAiStatus());
        if (!aiDone) {
            return PublicPortfolioResponse.builder()
                    .ready(false)
                    .status(portfolio.getAiStatus() != null ? portfolio.getAiStatus() : "generating")
                    .build();
        }

        Template template = templateRepository.findById(portfolio.getTemplateName())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Template not found: " + portfolio.getTemplateName()));

        Map<String, Object> components = parseJson(template.getComponents());
        Map<String, Object> placeholderMap = parseJson(portfolio.getPlaceholderMap());
        List<String> pages = null;
        if (template.getPages() != null) {
            try {
                pages = objectMapper.readValue(template.getPages(), List.class);
            } catch (Exception e) {
                log.warn("Failed to parse pages for template={}: {}", template.getId(), e.getMessage());
            }
        }

        log.info("RETRIEVED TEMPLATE: id={} type={} name={}", template.getId(), template.getTemplateType(), template.getName());

        return PublicPortfolioResponse.builder()
                .ready(true)
            .status(aiDone
                ? (portfolio.getStatus() != null ? portfolio.getStatus() : "published")
                : (portfolio.getAiStatus() != null ? portfolio.getAiStatus() : "generating"))
                .slug(portfolio.getSlug())
                .templateId(template.getId())
                .templateType(template.getTemplateType())
                .components(components)
                .cssCode(template.getCssCode())
                .placeholderMap(placeholderMap)
                .pages(pages)
                .build();
    }

    /**
     * Get user's own portfolio.
     */
    @Transactional(readOnly = true)
    public PortfolioResponse getMyPortfolio(UUID userId) {
        Portfolio portfolio = portfolioRepository.findByUserIdAndDeletedAtIsNull(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No portfolio found"));

        return buildPortfolioResponse(portfolio);
    }

    /**
     * Update portfolio — evicts Redis cache.
     */
    @Transactional
    public PortfolioResponse update(UUID userId, UUID portfolioId, Map<String, Object> updates) {
        Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);

        // Update allowed fields if present in the updates map
        if (updates.containsKey("templateName")) {
            portfolio.setTemplateName(updates.get("templateName").toString());
        }
        if (updates.containsKey("customDomain")) {
            portfolio.setCustomDomain(updates.get("customDomain").toString());
        }
        if (updates.containsKey("formData")) {
            try {
                @SuppressWarnings("unchecked")
                Map<String, Object> formData = (Map<String, Object>) updates.get("formData");
                portfolio.setRawFormData(objectMapper.writeValueAsString(formData));
            } catch (Exception e) {
                log.error("Failed to update formData: portfolioId={}", portfolioId);
            }
        }

        portfolioRepository.save(portfolio);
        evictPortfolioCache(portfolio.getSlug());

        log.info("Portfolio updated: portfolioId={} userId={}", portfolioId, userId);
        return buildPortfolioResponse(portfolio);
    }

    /**
     * Change template — plan-gated, triggers async AI template switch.
     * Evicts Redis cache.
     */
    @Transactional
    public PortfolioResponse changeTemplate(UUID userId, UUID portfolioId, String templateName) {
        Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);

        String normalizedTemplate = templateName != null ? templateName.trim() : "";
        if (normalizedTemplate.isBlank()) {
            throw new IllegalArgumentException("Template name is required");
        }

        Template template = templateRepository.findById(normalizedTemplate)
                .orElseThrow(() -> new IllegalArgumentException("Invalid template: " + normalizedTemplate));

        if (Boolean.FALSE.equals(template.getIsActive())) {
            throw new IllegalArgumentException("Template is inactive: " + normalizedTemplate);
        }

        // Keep current template active while AI regenerates content for the new one.
        // Save chosen template immediately so invalid legacy template values do not break update.
        // Public rendering still waits for aiStatus=done.
        portfolio.setTemplateName(normalizedTemplate);
        portfolio.setAiStatus("pending");
        portfolio.setStatus("generating");
        portfolioRepository.save(portfolio);

        // Parse formData for AI engine
        Map<String, Object> formData = parseJson(portfolio.getRawFormData());

        // Fire-and-forget AI template switch.
        // Important: async dispatch failures (e.g. task rejected) must NOT rollback template save.
        try {
            aiService.switchTemplate(userId.toString(), normalizedTemplate, formData);
        } catch (Exception e) {
            log.warn("Template switch AI dispatch failed but template saved: portfolioId={} template={} error={}",
                    portfolioId, normalizedTemplate, e.getMessage());
            portfolio.setAiStatus("done");
            portfolio.setStatus("published");
            portfolioRepository.save(portfolio);
        }

        evictPortfolioCache(portfolio.getSlug());
        log.info("Template change triggered: portfolioId={} template={}", portfolioId, normalizedTemplate);

        return buildPortfolioResponse(portfolio);
    }

    /**
     * Analytics — free plan: views count only. Pro: full analytics.
     */
    @Transactional(readOnly = true)
    public AnalyticsResponse getAnalytics(UUID userId, UUID portfolioId) {
        Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);
        Subscription sub = subscriptionRepository.findByUserId(userId).orElse(null);
        String plan = sub != null ? sub.getPlan() : "free";

        long views = viewRepository.countByPortfolioId(portfolioId);

        if ("free".equals(plan)) {
            return AnalyticsResponse.builder()
                    .views(views)
                    .build();
        }

        // Pro/Team: full analytics
        long uniqueVisitors = viewRepository.countDistinctVisitorsByPortfolioId(portfolioId);

        List<Object[]> countriesRaw = viewRepository.findTop5CountriesByPortfolioId(portfolioId);
        Map<String, Long> countries = new LinkedHashMap<>();
        for (Object[] row : countriesRaw) {
            countries.put(String.valueOf(row[0]), ((Number) row[1]).longValue());
        }

        List<Object[]> timelineRaw = viewRepository.findDailyViewsSince(
                portfolioId, LocalDateTime.now().minusDays(30));
        List<Map<String, Object>> timeline = new ArrayList<>();
        for (Object[] row : timelineRaw) {
            timeline.add(Map.of("date", row[0].toString(), "views", ((Number) row[1]).longValue()));
        }

        return AnalyticsResponse.builder()
                .views(views)
                .uniqueVisitors(uniqueVisitors)
                .countries(countries)
                .timeline(timeline)
                .build();
    }

    /**
     * Soft delete portfolio + clear AI cache.
     * Never hard deletes.
     */
    @Transactional
    public void delete(UUID userId, UUID portfolioId) {
        Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);
        portfolio.setDeletedAt(LocalDateTime.now());
        portfolioRepository.save(portfolio);

        evictPortfolioCache(portfolio.getSlug());
        aiService.clearCache(userId.toString());

        log.info("Portfolio soft-deleted: portfolioId={} userId={}", portfolioId, userId);
    }

    /**
     * Called by AiPollingTask when AI marks status as 'done'.
     * Saves AI result, evicts cache, sets user.is_new_user=false.
     */
    @Transactional
    @CacheEvict(value = "portfolio", key = "#portfolio.slug")
    public void saveAiResult(Portfolio portfolio, Map<String, Object> aiResponse) {
        try {
            Object templateObj = aiResponse.get("template");
            Object placeholderObj = aiResponse.get("placeholder_map");

            if (templateObj == null || placeholderObj == null) {
                log.warn("AI result missing template or placeholder_map for {}", portfolio.getId());
                return;
            }

            String newTemplate = templateObj.toString();
            String newPlaceholders = objectMapper.writeValueAsString(placeholderObj);

            // Version old placeholder_map before overwriting
            addToVersionHistory(portfolio, portfolio.getPlaceholderMap());

            portfolio.setTemplateName(newTemplate);
            portfolio.setPlaceholderMap(newPlaceholders);
            portfolio.setAiStatus("done");
            portfolio.setStatus("published");
            portfolio.setPublishedAt(LocalDateTime.now());
            portfolio.setLastAiUpdate(LocalDateTime.now());

            portfolioRepository.save(portfolio);

            // Mirror Redux finishOnboarding() — set user.is_new_user = false
            User user = portfolio.getUser();
            user.setIsNewUser(false);
            user.setAiGenCount(user.getAiGenCount() + 1);
            userRepository.save(user);

            log.info("AI result saved: userId={} template={}", user.getId(), newTemplate);

        } catch (Exception e) {
            log.error("Failed to save AI result: portfolioId={} error={}",
                    portfolio.getId(), e.getMessage());
        }
    }

    private void addToVersionHistory(Portfolio portfolio, String oldPlaceholderMap) {
        if (oldPlaceholderMap != null && !oldPlaceholderMap.isBlank()) {
            log.debug("Versioned placeholder_map for portfolioId={}", portfolio.getId());
        }
    }

    /**
     * Record portfolio view — called asynchronously on public portfolio access.
     */
    @Async
    public void recordView(UUID portfolioId, String visitorIp, String referrer) {
        try {
            Portfolio portfolio = portfolioRepository.findById(portfolioId).orElse(null);
            if (portfolio == null) return;

            PortfolioView view = PortfolioView.builder()
                    .portfolio(portfolio)
                    .visitorIp(visitorIp)
                    .referrer(referrer)
                    .viewedAt(LocalDateTime.now())
                    .build();

            viewRepository.save(view);

            // Increment denormalized views counter
            portfolio.setViews(portfolio.getViews() + 1);
            portfolioRepository.save(portfolio);

        } catch (Exception e) {
            log.warn("Failed to record view: portfolioId={} error={}", portfolioId, e.getMessage());
        }
    }

    // ===== HELPERS =====

    private Portfolio findOwnedPortfolio(UUID userId, UUID portfolioId) {
        Portfolio portfolio = portfolioRepository.findById(portfolioId)
                .filter(p -> p.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("Portfolio not found"));

        if (!portfolio.getUser().getId().equals(userId)) {
            throw new ForbiddenException("Access denied");
        }
        return portfolio;
    }

    private void evictPortfolioCache(String slug) {
        // CacheManager.evict() works even when called from non-proxy context (self-call).
        // @CacheEvict on a private method would be silently ignored by Spring AOP.
        Cache cache = cacheManager.getCache("portfolio");
        if (cache != null) {
            cache.evict(slug);
            log.debug("Cache evicted: portfolio slug={}", slug);
        }
    }

    public PortfolioResponse buildPortfolioResponse(Portfolio portfolio) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put("id", portfolio.getId().toString());
        inner.put("name", portfolio.getUser().getName());
        inner.put("slug", portfolio.getSlug());
        inner.put("templateName", portfolio.getTemplateName());
        inner.put("placeholderMap", parseJson(portfolio.getPlaceholderMap()));
        inner.put("status", portfolio.getStatus());
        inner.put("liveUrl", portfolio.getLiveUrl());
        inner.put("createdAt", portfolio.getCreatedAt() != null
                ? portfolio.getCreatedAt().toString() : null);
        inner.put("updatedAt", portfolio.getUpdatedAt() != null
                ? portfolio.getUpdatedAt().toString() : null);

        return new PortfolioResponse(inner);
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJson(String json) {
        if (json == null || json.isBlank()) return new HashMap<>();
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.warn("Failed to parse JSON field: {}", e.getMessage());
            return new HashMap<>();
        }
    }
}
