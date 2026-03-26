package com.portiva.backend.dto.portfolio;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Change template request — PATCH /portfolio/{id}/template
 * Uses templateName (string ID) not templateId.
 */
@Data
public class ChangeTemplateRequest {

    @NotBlank(message = "Template name is required")
    private String templateName;
}
