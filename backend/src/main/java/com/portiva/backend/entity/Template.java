package com.portiva.backend.entity;


import io.hypersistence.utils.hibernate.type.json.JsonType;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.Type;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Templates table — stores React JSX code.
 * Backend NEVER renders HTML. Frontend compiles JSX at runtime.
 * components/pages stored as JSONB (raw String — Jackson handles serialization in service layer).
 * NO html_content field — JSX only.
 */
@Entity
@Table(name = "templates")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Template {

    /**
     * Human-readable ID: e.g. 'developer_minimal', 'designer_visual'
     * Used as templateName throughout the system.
     */
    @Id
    @Column(name = "id", length = 50)
    private String id;

    @Column(name = "name", length = 100)
    private String name;

    @Column(name = "category", length = 50)
    private String category;

    /**
     * template_type: 'single' | 'multi'
     * single = one JSX component, multi = multiple pages
     */
    @Column(name = "template_type", length = 20)
    @Builder.Default
    private String templateType = "single";

    /**
     * JSONB — for single: {"main":"<JSX string>"}
     * for multi: {"layout":"<JSX>","home":"<JSX>","about":"<JSX>",...}
     * Stored as raw String, parsed by frontend.
     */
    @Type(JsonType.class)
    @Column(name = "components", columnDefinition = "jsonb")
    private String components;

    /**
     * JSONB — array of page names for multi-page templates.
     * e.g. ["home","about","projects","contact"]
     * Stored as raw JSON String.
     */
    @Type(JsonType.class)
    @Column(name = "pages", columnDefinition = "jsonb")
    private String pages;

    @Column(name = "css_code", columnDefinition = "TEXT")
    private String cssCode;

    @Column(name = "preview_image")
    private String previewImage;

    /**
     * Plan gate: 'free' | 'pro' | 'team'
     */
    @Column(name = "required_plan", length = 20)
    @Builder.Default
    private String requiredPlan = "free";

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    /**
     * JSONB — placeholder schema for this template.
     * Defines: required keys, ai_keys, contact/experience/project patterns.
     * Sent to AI engine so it generates exactly the keys this template needs.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "placeholder_schema", columnDefinition = "jsonb")
    private String placeholderSchema;

    /**
     * JSONB — scoring rules for AI template selection.
     * Defines: min_skills, requires_experience, score_weights etc.
     * AI engine uses this to pick the best template for a user's profile.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "selection_rules", columnDefinition = "jsonb")
    private String selectionRules;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
