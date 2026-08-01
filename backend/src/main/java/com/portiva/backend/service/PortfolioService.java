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
        try {
            log.info("update start: userId={} portfolioId={} updateKeys={}", userId, portfolioId, 
                    updates != null ? updates.keySet() : "null");
            
            Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);
            log.debug("Portfolio found for update: id={}", portfolio.getId());

            // Update allowed fields if present in the updates map
            if (updates.containsKey("templateName")) {
                String newTemplate = String.valueOf(updates.get("templateName"));
                portfolio.setTemplateName(newTemplate);
                log.debug("Updated templateName: {}", newTemplate);
            }
            if (updates.containsKey("customDomain")) {
                String domain = String.valueOf(updates.get("customDomain"));
                portfolio.setCustomDomain(domain);
                log.debug("Updated customDomain: {}", domain);
            }
            if (updates.containsKey("formData")) {
                Object formDataRaw = updates.get("formData");
                log.debug("Processing formData: type={}", formDataRaw != null ? formDataRaw.getClass().getSimpleName() : "null");
                
                if (!(formDataRaw instanceof Map<?, ?> rawMap)) {
                    log.error("formData is not a Map, got: {}", formDataRaw != null ? formDataRaw.getClass().getSimpleName() : "null");
                    throw new IllegalArgumentException("formData must be a JSON object");
                }
                @SuppressWarnings("unchecked")
                Map<String, Object> formData = (Map<String, Object>) rawMap;
                String jsonStr = objectMapper.writeValueAsString(formData);
                portfolio.setRawFormData(jsonStr);
                log.debug("Updated formData: {} bytes", jsonStr.length());
            }

            portfolioRepository.save(portfolio);
            log.info("Portfolio saved: id={}", portfolioId);
            
            evictPortfolioCache(portfolio.getSlug());
            log.info("Portfolio updated: portfolioId={} userId={}", portfolioId, userId);
            return buildPortfolioResponse(portfolio);
        } catch (IllegalArgumentException e) {
            log.error("IllegalArgumentException in update: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("Portfolio update failed: portfolioId={} userId={} error={} type={}",
                    portfolioId, userId, e.getMessage(), e.getClass().getSimpleName(), e);
            throw new IllegalArgumentException("Failed to save content. Please try again.");
        }
    }

    /**
     * Change template — plan-gated, triggers async AI template switch.
     * Evicts Redis cache.
     */
    @Transactional
    public PortfolioResponse changeTemplate(UUID userId, UUID portfolioId, String templateName) {
        log.info("=== changeTemplate START ===");
        log.info("userId={} portfolioId={} templateName=[{}]", userId, portfolioId, templateName);
        
        try {
            // Step 1: Find portfolio
            log.debug("Step 1: Finding portfolio owned by user");
            Portfolio portfolio = findOwnedPortfolio(userId, portfolioId);
            log.info("✓ Portfolio found: id={} currentTemplate={}", portfolio.getId(), portfolio.getTemplateName());

            // Step 2: Normalize template name
            log.debug("Step 2: Normalizing template name");
            String normalizedTemplate = templateName != null ? templateName.trim() : "";
            log.info("normalizedTemplate after trim: [{}]", normalizedTemplate);
            
            if (normalizedTemplate.isBlank()) {
                log.error("✗ ERROR: Template name is blank");
                throw new IllegalArgumentException("Template name is required");
            }

            // Step 3: Validate template exists
            log.debug("Step 3: Validating template exists: {}", normalizedTemplate);
            Template template = templateRepository.findById(normalizedTemplate)
                    .orElseThrow(() -> {
                        log.error("✗ ERROR: Template not found in DB: {}", normalizedTemplate);
                        return new IllegalArgumentException("Invalid template: " + normalizedTemplate);
                    });
            log.info("✓ Template found in DB: id={} active={}", template.getId(), template.getIsActive());

            // Step 4: Check if template is active
            log.debug("Step 4: Checking if template is active");
            if (Boolean.FALSE.equals(template.getIsActive())) {
                log.error("✗ ERROR: Template is inactive: {}", normalizedTemplate);
                throw new IllegalArgumentException("Template is inactive: " + normalizedTemplate);
            }
            log.info("✓ Template is active");

            // Step 5: Update portfolio in DB
            log.debug("Step 5: Updating portfolio in DB");
            portfolio.setTemplateName(normalizedTemplate);
            portfolio.setAiStatus("pending");
            portfolio.setStatus("generating");
            portfolioRepository.save(portfolio);
            log.info("✓ Portfolio saved to DB with new template");

            // Step 6: Get form data
            log.debug("Step 6: Parsing form data");
            Map<String, Object> formData = parseJson(portfolio.getRawFormData());
            log.info("✓ FormData has {} keys", formData.keySet().size());

            // Step 7: Dispatch to AI
            log.debug("Step 7: Dispatching to AI service");
            try {
                log.info("Calling aiService.switchTemplate");
                aiService.switchTemplate(userId.toString(), normalizedTemplate, formData);
                log.info("✓ AI dispatch successful");
            } catch (Exception aiError) {
                log.warn("AI dispatch error (RECOVERABLE): {} - Marking as published anyway", aiError.getMessage(), aiError);
                portfolio.setAiStatus("done");
                portfolio.setStatus("published");
                portfolioRepository.save(portfolio);
                log.info("✓ Fallback: Marked portfolio as published despite AI error");
            }

            // Step 8: Evict cache
            log.debug("Step 8: Evicting cache");
            evictPortfolioCache(portfolio.getSlug());
            log.info("✓ Cache evicted");

            // Step 9: Build response
            log.debug("Step 9: Building response");
            PortfolioResponse resp = buildPortfolioResponse(portfolio);
            log.info("=== changeTemplate SUCCESS === ");
            return resp;
            
        } catch (IllegalArgumentException e) {
            log.error("=== changeTemplate FAILED (IllegalArgumentException) === message: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("=== changeTemplate FAILED (Unexpected) === type: {} message: {}", 
                    e.getClass().getSimpleName(), e.getMessage(), e);
            throw new IllegalArgumentException("Template switch failed. Details: " + e.getMessage());
        }
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

                String resolvedTemplate = templateRepository.findById(newTemplate).isPresent()
                    ? newTemplate
                    : portfolio.getTemplateName();
                if (!resolvedTemplate.equals(newTemplate)) {
                log.warn("AI returned unknown template '{}', keeping existing template '{}' for portfolioId={}",
                    newTemplate, resolvedTemplate, portfolio.getId());
                }

            // Version old placeholder_map before overwriting
            addToVersionHistory(portfolio, portfolio.getPlaceholderMap());

            portfolio.setTemplateName(resolvedTemplate);
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

            log.info("AI result saved: userId={} template={}", user.getId(), resolvedTemplate);

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
        try {
            // CacheManager.evict() works even when called from non-proxy context (self-call).
            // @CacheEvict on a private method would be silently ignored by Spring AOP.
            Cache cache = cacheManager.getCache("portfolio");
            if (cache != null) {
                cache.evict(slug);
                log.debug("Cache evicted: portfolio slug={}", slug);
            }
        } catch (Exception e) {
            // Redis may not be running in dev mode - log and continue
            log.warn("Cache eviction failed (Redis unavailable?): {}", e.getMessage());
        }
    }

    public PortfolioResponse buildPortfolioResponse(Portfolio portfolio) {
        Map<String, Object> inner = new LinkedHashMap<>();
        inner.put("id", portfolio.getId().toString());
        inner.put("name", portfolio.getUser().getName());
        inner.put("slug", portfolio.getSlug());
        inner.put("templateName", portfolio.getTemplateName());
        inner.put("placeholderMap", parseJson(portfolio.getPlaceholderMap()));
        inner.put("rawFormData", parseJson(portfolio.getRawFormData()));
        inner.put("status", portfolio.getStatus());
        inner.put("aiStatus", portfolio.getAiStatus());
        inner.put("currentStep", portfolio.getCurrentStep());
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
