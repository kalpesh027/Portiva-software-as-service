package com.portiva.backend.dto.template;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * TemplateResponseDTO — template info with image for frontend
 * Includes: id, name, category, type, required_plan, preview_image_url
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TemplateResponseDTO {

    private String id;
    private String name;
    private String category;
    private String templateType;
    private String requiredPlan;
    private String previewImage;
    private Boolean isActive;
    private Integer sortOrder;

    // Additional UI metadata for frontend
    private String color;
    private String description;
    private String[] features;

    /**
     * Simplified constructor from Template entity + UI metadata
     */
    public static TemplateResponseDTO fromTemplate(
            String id,
            String name,
            String category,
            String templateType,
            String requiredPlan,
            String previewImage,
            Boolean isActive,
            Integer sortOrder,
            String color,
            String description,
            String[] features
    ) {
        return TemplateResponseDTO.builder()
                .id(id)
                .name(name)
                .category(category)
                .templateType(templateType)
                .requiredPlan(requiredPlan)
                .previewImage(previewImage)
                .isActive(isActive)
                .sortOrder(sortOrder)
                .color(color)
                .description(description)
                .features(features)
                .build();
    }
}
