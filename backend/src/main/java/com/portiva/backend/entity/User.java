package com.portiva.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Users table — core identity entity.
 * Soft delete via deleted_at. Hard DELETEs are never performed.
 * is_new_user mirrors Redux authSlice.isNewUser flag.
 */
@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_users_email", columnList = "email")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(columnDefinition = "uuid", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "name", length = 100, nullable = false)
    private String name;

    @Column(name = "email", length = 255, unique = true, nullable = false)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "title", length = 100)
    private String title;

    @Column(name = "avatar")
    private String avatar;

    @Column(name = "location")
    private String location;

    @Column(name = "website")
    private String website;

    /**
     * Role: 'user' or 'admin'
     * Stored as plain VARCHAR — simple two-value set, no enum table needed.
     */
    @Column(name = "role", length = 20, nullable = false)
    @Builder.Default
    private String role = "user";

    @Column(name = "otp", length = 6)
    private String otp;

    @Column(name = "otp_expires_at")
    private LocalDateTime otpExpiresAt;

    @Column(name = "email_verified", nullable = false)
    @Builder.Default
    private Boolean emailVerified = false;

    /**
     * Mirrors Redux authSlice.isNewUser.
     * Set to false when AI generation completes (finishOnboarding).
     */
    @Column(name = "is_new_user", nullable = false)
    @Builder.Default
    private Boolean isNewUser = true;

    @Column(name = "ai_gen_count", nullable = false)
    @Builder.Default
    private Integer aiGenCount = 0;

    @Column(name = "razorpay_customer_id")
    private String razorpayCustomerId;

    /**
     * Soft delete — never hard DELETE.
     * All queries filter WHERE deleted_at IS NULL.
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
