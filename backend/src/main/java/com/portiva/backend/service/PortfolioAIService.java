package com.portiva.backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.portiva.backend.entity.Template;
import com.portiva.backend.repository.TemplateRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Portfolio AI Engine integration service.
 *
 * DESIGN PRINCIPLES:
 * - ALL @Async methods catch every exception — user already got 200, never propagate.
 * - RestTemplate configured with 5s connect / 10s read timeout.
 * - Returns Optional.empty() on any failure — callers handle absence gracefully.
 * - fire-and-forget pattern: user never waits for AI.
 */
@Slf4j
@Service
public class PortfolioAIService {

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final TemplateRepository templateRepository;
    private final String aiEngineUrl;

    public PortfolioAIService(
            RestTemplate aiRestTemplate,
            ObjectMapper objectMapper,
            TemplateRepository templateRepository,
            @Value("${ai.engine.url}") String aiEngineUrl
    ) {
        this.restTemplate = aiRestTemplate;
        this.objectMapper = objectMapper;
        this.templateRepository = templateRepository;
        this.aiEngineUrl = aiEngineUrl;
    }

    /**
     * Build template_schemas map from all active templates.
     * Sends placeholder_schema + selection_rules per template to AI engine.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildTemplateSchemas() throws Exception {
        List<Template> templates = templateRepository.findByIsActiveTrueOrderBySortOrderAsc();
        Map<String, Object> templateSchemas = new LinkedHashMap<>();
        for (Template t : templates) {
            if (t.getPlaceholderSchema() == null) continue;
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("placeholder_schema", objectMapper.readValue(t.getPlaceholderSchema(), Map.class));
            entry.put("selection_rules", objectMapper.readValue(
                    t.getSelectionRules() != null ? t.getSelectionRules() : "{}", Map.class));
            entry.put("template_type", t.getTemplateType());
                entry.put("required_plan", "free");
            templateSchemas.put(t.getId(), entry);
        }
        return templateSchemas;
    }

    /**
     * Fire-and-forget: trigger AI generation for a user's portfolio.
     * Called after /portfolio/generate returns — does NOT block the HTTP response.
     *
     * POST {ai.engine.url}/api/pre-generate
     * Body: { user_id, user_data, template_schemas }
     *
     * Catches ALL exceptions — logs and returns. Never throws.
     */
    @Async("aiExecutor")
    public void startGeneration(String userId, Map<String, Object> formData) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("user_id", userId);
            body.put("user_data", formData);
            body.put("template_schemas", buildTemplateSchemas());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            log.info("AI generation started for userId: {}", userId);

            ResponseEntity<String> response = restTemplate.exchange(
                    aiEngineUrl + "/api/pre-generate",
                    HttpMethod.POST,
                    entity,
                    String.class
            );

            log.info("AI generation triggered: userId={} status={}", userId, response.getStatusCode());

        } catch (Exception e) {
            // NEVER rethrow — user already received 200 from /portfolio/generate
            log.error("AI generation failed: userId={} error={}", userId, e.getMessage());
        }
    }

    /**
     * Poll AI status for a given userId.
     * Called by AiPollingTask every 30 seconds.
     *
     * GET {ai.engine.url}/api/status/{userId}
     * Returns: { status: 'generating'|'done', placeholder_map?: {...} }
     *
     * Returns Optional.empty() on any exception — polling task handles absence.
     */
    public Optional<Map<String, Object>> checkStatus(String userId) {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiEngineUrl + "/api/status/" + userId,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = objectMapper.readValue(
                        response.getBody(),
                        new TypeReference<>() {}
                );
                return Optional.of(result);
            }

            return Optional.empty();

        } catch (Exception e) {
            log.warn("AI status check failed: userId={} error={}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Fetch completed portfolio data from AI engine.
     * Called by AiPollingTask when status is 'done'.
     *
     * GET {ai.engine.url}/api/portfolio/{userId}
     */
    public Optional<Map<String, Object>> getPortfolio(String userId) {
        try {
            ResponseEntity<String> response = restTemplate.getForEntity(
                    aiEngineUrl + "/api/portfolio/" + userId,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> result = objectMapper.readValue(
                        response.getBody(),
                        new TypeReference<>() {}
                );
                return Optional.of(result);
            }

            return Optional.empty();

        } catch (Exception e) {
            log.warn("AI portfolio fetch failed: userId={} error={}", userId, e.getMessage());
            return Optional.empty();
        }
    }

    /**
     * Fire-and-forget: switch template on AI engine.
     * User does not wait for this — returns immediately to client.
     *
     * POST {ai.engine.url}/api/switch-template
     * Body: { user_id, new_template_id, user_data, template_schemas }
     */
    @Async("aiExecutor")
    public void switchTemplate(String userId, String templateName, Map<String, Object> formData) {
        try {
            Map<String, Object> body = new LinkedHashMap<>();
            body.put("user_id", userId);
            body.put("new_template_id", templateName);  // forced — AI skips scoring
            body.put("user_data", formData);
            body.put("template_schemas", buildTemplateSchemas());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(
                    aiEngineUrl + "/api/switch-template",
                    entity,
                    String.class
            );

            log.info("Template switch started: userId={} template={}", userId, templateName);

        } catch (Exception e) {
            log.error("switchTemplate failed: userId={} error={}", userId, e.getMessage());
        }
    }

    /**
     * Clear AI engine cache for a user — called on portfolio delete or update.
     *
     * DELETE {ai.engine.url}/api/cache/{userId}
     */
    public void clearCache(String userId) {
        try {
            restTemplate.delete(aiEngineUrl + "/api/cache/" + userId);
            log.info("AI cache cleared: userId={}", userId);
        } catch (Exception e) {
            // Non-fatal — log and move on
            log.warn("AI cache clear failed: userId={} error={}", userId, e.getMessage());
        }
    }
}
