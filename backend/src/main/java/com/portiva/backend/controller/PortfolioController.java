package com.portiva.backend.controller;

import com.portiva.backend.dto.portfolio.*;
import com.portiva.backend.service.PortfolioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Portfolio controller — /portfolio/** (authenticated)
 *
 * POST  /portfolio/generate      — trigger AI generation (< 200ms)
 * GET   /portfolio/me            — get user's portfolio
 * PUT   /portfolio/{id}          — update portfolio
 * PATCH /portfolio/{id}/template — change template (templateName, not templateId)
 * GET   /portfolio/{id}/analytics — get analytics
 * DELETE /portfolio/{id}         — soft delete
 */
@Slf4j
@RestController
@RequestMapping("/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    /**
     * POST /portfolio/generate
     * formData is Map<String,Object> — any shape, any step count.
     * MUST return < 200ms — AI fires async.
     */
    @PostMapping("/generate")
    public ResponseEntity<GenerateResponse> generate(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody GenerateRequest req
    ) {
        return ResponseEntity.ok(portfolioService.generate(userId, req.getFormData()));
    }

    /** GET /portfolio/me */
    @GetMapping("/me")
    public ResponseEntity<PortfolioResponse> getMyPortfolio(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(portfolioService.getMyPortfolio(userId));
    }

    /** PUT /portfolio/{id} */
    @PutMapping("/{id}")
    public ResponseEntity<PortfolioResponse> update(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @RequestBody Map<String, Object> updates
    ) {
        return ResponseEntity.ok(portfolioService.update(userId, id, updates));
    }

    /**
     * PATCH /portfolio/{id}/template
     * Body: { templateName: string } — NOT templateId
     */
    @PatchMapping("/{id}/template")
    public ResponseEntity<PortfolioResponse> changeTemplate(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id,
            @Valid @RequestBody ChangeTemplateRequest req
    ) {
        return ResponseEntity.ok(portfolioService.changeTemplate(userId, id, req.getTemplateName()));
    }

    /** GET /portfolio/{id}/analytics */
    @GetMapping("/{id}/analytics")
    public ResponseEntity<AnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        return ResponseEntity.ok(portfolioService.getAnalytics(userId, id));
    }

    /**
     * DELETE /portfolio/{id}
     * Soft delete — sets deleted_at, does NOT hard delete.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> delete(
            @AuthenticationPrincipal UUID userId,
            @PathVariable UUID id
    ) {
        portfolioService.delete(userId, id);
        return ResponseEntity.ok(Map.of("message", "Portfolio deleted successfully"));
    }

    /**
     * POST /portfolio/save-draft
     * Saves form progress after each step without triggering AI.
     * Idempotent — creates or updates the draft portfolio.
     * Body: { formData: {...}, currentStep: 3 }
     */
    @PostMapping("/save-draft")
    public ResponseEntity<SaveDraftResponse> saveDraft(
            @AuthenticationPrincipal UUID userId,
            @RequestBody SaveDraftRequest req
    ) {
        return ResponseEntity.ok(portfolioService.saveDraft(userId, req.getFormData(), req.getCurrentStep()));
    }

    /**
     * GET /portfolio/slug-check?name=John Doe
     * Returns { slug: "john-doe", available: true/false }.
     * Called in real-time as user types their name.
     */
    @GetMapping("/slug-check")
    public ResponseEntity<SlugCheckResponse> checkSlug(
            @AuthenticationPrincipal UUID userId,
            @RequestParam String name
    ) {
        return ResponseEntity.ok(portfolioService.checkSlug(userId, name));
    }
}
