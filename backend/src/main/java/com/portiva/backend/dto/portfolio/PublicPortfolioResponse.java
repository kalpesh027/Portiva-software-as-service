package com.portiva.backend.dto.portfolio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Public portfolio response — returned by GET /portfolio/public/{slug}.
 *
 * When ready=false: only ready, status, slug are populated.
 * When ready=true: all fields populated for frontend JSX rendering.
 *
 * Frontend compiles JSX template from components and renders using placeholder_map.
 * Backend NEVER renders HTML.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicPortfolioResponse {

    private Boolean ready;
    private String status;
    private String slug;

    /** Template ID — frontend uses this to dynamically import the template file */
    private String templateId;

    // Only populated when ready=true:

    /** 'single' | 'multi' */
    private String templateType;

    /**
     * JSX components — for single: {main: "<JSX>"}
     * for multi: {layout: "<JSX>", home: "<JSX>", about: "<JSX>", ...}
     */
    private Map<String, Object> components;

    /** Raw CSS string for the template */
    private String cssCode;

    /**
     * Placeholder map — filled by AI.
     * Keys: name, title, about, skills, contact_email, contact_linkedin, etc.
     * AI can add any additional keys — fully flexible.
     */
    private Map<String, Object> placeholderMap;

    /** Page list for multi-page templates: ["home","about","projects","contact"] */
    private List<String> pages;
}
