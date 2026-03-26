package com.portiva.backend.service;

import com.portiva.backend.dto.template.TemplateResponseDTO;
import com.portiva.backend.entity.Template;
import com.portiva.backend.repository.TemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * TemplateService — provides templates with UI metadata and images
 * Enriches templates with color, description, features for frontend display
 */
@Service
@RequiredArgsConstructor
public class TemplateService {

    private final TemplateRepository templateRepository;

        @Value("${app.frontend-url:http://localhost:5173}")
        private String frontendUrl;

    /**
     * Template UI metadata mapping — color, description, features for frontend
     */
    private static final Map<String, TemplateMetadata> TEMPLATE_METADATA = new HashMap<>();
    private static final Set<String> IMPLEMENTED_TEMPLATE_IDS = new HashSet<>(List.of(
            "developer_minimal",
            "developer_modern",
            "developer_resume_multi",
            "developer_spline_showcase",
            "designer_visual",
            "freelancer_cards"
    ));

    static {
        TEMPLATE_METADATA.put("developer_minimal", TemplateMetadata.builder()
                .color("#8B5CF6")
                .description("Clean, single-page developer layout with minimal UI and fast loading")
                .features(new String[]{"Minimal UI", "Fast Loading", "Mobile First"})
                                .imageUrl("/template-images/developer-minimal.png")
                .build());

        TEMPLATE_METADATA.put("developer_modern", TemplateMetadata.builder()
                .color("#6366F1")
                .description("Dark theme with code aesthetic and bold typography")
                .features(new String[]{"Bold Typography", "Project Focus", "Code Sections"})
                .imageUrl("/template-images/developer-modern.png")
                .build());

        TEMPLATE_METADATA.put("developer_resume_multi", TemplateMetadata.builder()
                .color("#10B981")
                .description("Multi-page resume layout with career timeline and achievements")
                .features(new String[]{"Multi Page", "Resume Style", "Career Timeline"})
                .imageUrl("/template-images/developer-resume-multi.png")
                .build());

        TEMPLATE_METADATA.put("designer_visual", TemplateMetadata.builder()
                .color("#EC4899")
                .description("Visual-first grid layout with image gallery and portfolio showcase")
                .features(new String[]{"Image Gallery", "Visual Focus", "Portfolio Grid"})
                .imageUrl("/template-images/designer-visual.png")
                .build());

        TEMPLATE_METADATA.put("freelancer_cards", TemplateMetadata.builder()
                .color("#F59E0B")
                .description("Service cards layout with testimonials and client focus")
                .features(new String[]{"Service Cards", "Client Focus", "Testimonials"})
                .imageUrl("/template-images/freelancer-cards.png")
                .build());
    }

    /**
     * Get all active templates with UI metadata
     */
    public List<TemplateResponseDTO> getAllTemplates() {
        return templateRepository.findByIsActiveTrueOrderBySortOrderAsc()
                .stream()
                                .filter(t -> IMPLEMENTED_TEMPLATE_IDS.contains(t.getId()))
                .map(this::toResponseDTO)
                .collect(Collectors.toList());
    }

    /**
     * Get single template by ID with UI metadata
     */
    public TemplateResponseDTO getTemplateById(String id) {
                if (!IMPLEMENTED_TEMPLATE_IDS.contains(id)) {
                        throw new RuntimeException("Template not found: " + id);
                }
        Template template = templateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found: " + id));
        return toResponseDTO(template);
    }

    /**
     * Convert Template entity to ResponseDTO with metadata
     */
    private TemplateResponseDTO toResponseDTO(Template template) {
        TemplateMetadata metadata = TEMPLATE_METADATA.getOrDefault(
                template.getId(),
                TemplateMetadata.builder()
                        .color("#9CA3AF")
                        .description(template.getCategory())
                        .features(new String[]{})
                                                .imageUrl("/template-images/developer-minimal.png")
                        .build()
        );

                String resolvedPreviewImage = resolvePreviewImage(template.getPreviewImage(), metadata.getImageUrl());

        return TemplateResponseDTO.builder()
                .id(template.getId())
                .name(template.getName())
                .category(template.getCategory())
                .templateType(template.getTemplateType())
                .requiredPlan("free")
                                .previewImage(resolvedPreviewImage)
                .isActive(template.getIsActive())
                .sortOrder(template.getSortOrder())
                .color(metadata.getColor())
                .description(metadata.getDescription())
                .features(metadata.getFeatures())
                .build();
    }

        private String resolvePreviewImage(String dbImage, String fallbackImage) {
                String candidate = (dbImage != null && !dbImage.isBlank()) ? dbImage.trim() : fallbackImage;

                // Fix legacy API-prefixed paths saved in DB.
                candidate = candidate.replace("/api/template-images/", "/template-images/");

                // Prefer PNG previews for consistent rendering across clients.
                if (candidate.endsWith(".svg")) {
                        candidate = candidate.substring(0, candidate.length() - 4) + ".png";
                }

                // Keep fully qualified URLs as-is.
                if (candidate.startsWith("http://") || candidate.startsWith("https://")) {
                        return candidate;
                }

                // Ensure relative asset paths become absolute URLs for public/slugs contexts.
                String base = firstFrontendUrl();
                if (!candidate.startsWith("/")) {
                        candidate = "/" + candidate;
                }
                return base + candidate;
        }

        private String firstFrontendUrl() {
                String[] urls = frontendUrl.split(",");
                String first = urls.length > 0 ? urls[0].trim() : "http://localhost:5173";
                if (first.endsWith("/")) {
                        return first.substring(0, first.length() - 1);
                }
                return first;
        }

    /**
     * Internal metadata holder for template UI data
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class TemplateMetadata {
        private String color;
        private String description;
        private String[] features;
        private String imageUrl;
    }
}
