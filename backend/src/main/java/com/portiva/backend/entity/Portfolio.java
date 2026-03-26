package com.portiva.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Portfolios table — core portfolio entity.
 *
 * SCHEMA-LESS DESIGN:
 * raw_form_data = entire formData from frontend as JSONB.
 * Never hardcode 7 steps here. Any shape, any future step.
 *
 * placeholder_map = JSONB from AI engine.
 * template_name = string ID (matches templates.id).
 *
 * Soft delete via deleted_at.
 */
@Entity
@Table(
    name = "portfolios",
    indexes = {
        @Index(name = "idx_portfolios_slug", columnList = "slug"),
        @Index(name = "idx_portfolios_user_id", columnList = "user_id"),
        @Index(name = "idx_portfolios_ai_status", columnList = "ai_status")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Portfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Template name — references templates.id.
     * e.g. 'developer_minimal', 'pending' while AI runs.
     */
    @Column(name = "template_name", length = 100)
    private String templateName;

    /**
     * JSONB — placeholder map filled by AI engine.
     * Keys: {{name}}, {{title}}, {{about}}, {{skills}}, {{contact_email}}, etc.
     * AI can add any keys — fully flexible.
     * Stored as raw JSON String.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "placeholder_map", columnDefinition = "jsonb")
    private String placeholderMap;

    /**
     * JSONB — entire formData from frontend, schema-less.
     * shape: {name, title, about, skills[], experience[], projects[],
     *         education[], testimonials[], blogs[], contact:{...}}
     * Any future steps stored here automatically — zero Java changes needed.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "raw_form_data", columnDefinition = "jsonb")
    private String rawFormData;

    @Column(name = "slug", unique = true)
    private String slug;

    @Column(name = "live_url")
    private String liveUrl;

    @Column(name = "custom_domain")
    private String customDomain;

    /**
     * Last step the user was on when they saved draft (1-7).
     * Used to resume the create-portfolio stepper on re-login.
     */
    @Column(name = "current_step")
    @Builder.Default
    private Integer currentStep = 1;

    /**
     * Portfolio status: 'generating' | 'published' | 'draft'
     */
    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "generating";

    /**
     * AI generation status: 'pending' | 'generating' | 'done' | 'failed'
     */
    @Column(name = "ai_status", length = 30)
    @Builder.Default
    private String aiStatus = "pending";

    @Column(name = "views")
    @Builder.Default
    private Long views = 0L;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "last_ai_update")
    private LocalDateTime lastAiUpdate;

    /**
     * Soft delete — never hard DELETE.
     */
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
