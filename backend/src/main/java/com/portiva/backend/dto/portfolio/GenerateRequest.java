package com.portiva.backend.dto.portfolio;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Map;

/**
 * Portfolio generate request.
 *
 * CRITICAL: formData is Map<String,Object> — never hardcode 7 steps.
 * Backend receives whatever the frontend sends and stores it as JSONB.
 * This is the Notion/Vercel/Linear pattern for flexible schema.
 *
 * Only @NotNull on formData itself — inner fields are NEVER validated in Java.
 */
@Data
public class GenerateRequest {

    @NotNull(message = "Form data is required")
    private Map<String, Object> formData;
}
