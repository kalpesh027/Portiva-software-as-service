package com.portiva.backend.config;

import com.portiva.backend.entity.Template;
import com.portiva.backend.entity.User;
import com.portiva.backend.repository.TemplateRepository;
import com.portiva.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DataLoader — runs once at application startup.
 * Seeds starter templates and admin user if not present.
 * Idempotent: checks existence before inserting.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements ApplicationRunner {

    private final TemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

        private static final List<String> IMPLEMENTED_TEMPLATE_IDS = List.of(
            "developer_minimal",
            "developer_modern",
            "developer_resume_multi",
            "developer_spline_showcase",
            "designer_visual",
            "freelancer_cards"
        );

    @Value("${app.admin.email:admin@portiva.com}")
    private String adminEmail;

    @Value("${app.admin.password:Admin@Portiva123}")
    private String adminPassword;

    @Override
    public void run(ApplicationArguments args) {
        seedTemplates();
        seedAdminUser();
    }

    private void seedTemplates() {
        seedTemplate(
                "developer_minimal",
                "Developer Minimal",
                "developer",
                "single",
                "free",
                // components JSON — minimal sections
                "{\"main\":\"<JSX placeholder — replace with real JSX>\"}",
                // pages JSON
                "[\"home\",\"about\",\"projects\",\"contact\"]",
                // CSS
                ":root { --primary: #6366f1; --bg: #ffffff; --text: #1e293b; }",
                // placeholder_schema
                "{\"required\":[\"name\",\"title\",\"about\",\"skills\",\"hero_headline\",\"tagline\",\"cta_primary\",\"seo_title\",\"seo_description\"],\"contact\":[\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\"],\"experience\":[\"exp_count\",\"exp_N_company\",\"exp_N_role\",\"exp_N_duration\",\"exp_N_highlight\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_github_url\"],\"ai_keys\":[\"hero_headline\",\"tagline\",\"cta_primary\",\"cta_secondary\",\"about_extended\",\"exp_N_highlight\",\"seo_title\",\"seo_description\",\"years_experience\"]}",
                // selection_rules
                "{\"min_skills\":1,\"requires_experience\":false,\"requires_projects\":false,\"best_for\":\"any developer\",\"score_weights\":{\"has_experience\":1,\"has_projects\":1,\"skill_count\":0.5}}",
                1
        );

        seedTemplate(
                "developer_modern",
                "Developer Modern",
                "developer",
                "single",
            "free",
                "{\"main\":\"<JSX placeholder — replace with real JSX>\"}",
                "[\"home\",\"about\",\"experience\",\"projects\",\"contact\"]",
                ":root { --primary: #0ea5e9; --bg: #0f172a; --text: #f1f5f9; }",
                "{\"required\":[\"name\",\"title\",\"about\",\"skills\",\"hero_headline\",\"tagline\",\"cta_primary\",\"seo_title\",\"seo_description\"],\"contact\":[\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\"],\"experience\":[\"exp_count\",\"exp_N_company\",\"exp_N_role\",\"exp_N_duration\",\"exp_N_highlight\",\"exp_N_tech_used\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_github_url\",\"project_N_tagline\"],\"testimonials\":[\"testimonial_count\",\"testimonial_N_name\",\"testimonial_N_role\",\"testimonial_N_text\"],\"ai_keys\":[\"hero_headline\",\"tagline\",\"cta_primary\",\"cta_secondary\",\"about_extended\",\"exp_N_highlight\",\"project_N_tagline\",\"seo_title\",\"seo_description\",\"years_experience\"]}",
                "{\"min_skills\":2,\"requires_experience\":true,\"requires_projects\":false,\"best_for\":\"experienced developer\",\"score_weights\":{\"has_experience\":3,\"has_projects\":2,\"skill_count\":0.5,\"exp_count\":1}}",
                2
        );

        seedTemplate(
                "designer_visual",
                "Designer Visual",
                "designer",
                "single",
            "free",
                "{\"main\":\"<JSX placeholder — replace with real JSX>\"}",
                "[\"home\",\"work\",\"about\",\"contact\"]",
                ":root { --primary: #ec4899; --bg: #fdf4ff; --text: #1e1b4b; }",
                "{\"required\":[\"name\",\"title\",\"about\",\"skills\",\"hero_headline\",\"tagline\",\"seo_title\",\"seo_description\"],\"contact\":[\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_tagline\"],\"testimonials\":[\"testimonial_count\",\"testimonial_N_name\",\"testimonial_N_role\",\"testimonial_N_text\"],\"ai_keys\":[\"hero_headline\",\"tagline\",\"about_extended\",\"project_N_tagline\",\"seo_title\",\"seo_description\",\"cta_primary\"]}",
                "{\"min_skills\":1,\"requires_experience\":false,\"requires_projects\":true,\"best_for\":\"designer or visual creator\",\"score_weights\":{\"has_projects\":3,\"has_testimonials\":2,\"skill_count\":0.3}}",
                3
        );

        seedTemplate(
                "freelancer_cards",
                "Freelancer Cards",
                "freelancer",
                "single",
            "free",
                "{\"main\":\"<JSX placeholder — replace with real JSX>\"}",
                "[\"home\",\"services\",\"portfolio\",\"about\",\"contact\"]",
                ":root { --primary: #f59e0b; --bg: #fffbeb; --text: #292524; }",
                "{\"required\":[\"name\",\"title\",\"about\",\"skills\",\"hero_headline\",\"tagline\",\"seo_title\",\"seo_description\"],\"contact\":[\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_tagline\"],\"testimonials\":[\"testimonial_count\",\"testimonial_N_name\",\"testimonial_N_role\",\"testimonial_N_text\"],\"services\":[\"service_count\",\"service_N_name\",\"service_N_description\",\"service_N_price\"],\"ai_keys\":[\"hero_headline\",\"tagline\",\"about_extended\",\"project_N_tagline\",\"service_N_description\",\"seo_title\",\"seo_description\",\"cta_primary\"]}",
                "{\"min_skills\":1,\"requires_experience\":false,\"requires_projects\":false,\"best_for\":\"freelancer or consultant\",\"score_weights\":{\"has_projects\":2,\"has_testimonials\":3,\"skill_count\":0.3}}",
                4
        );

            seedTemplate(
                "developer_resume_multi",
                "Developer Resume Multi",
                "developer",
                "multi",
                "free",
                "{}",
                "[\"home\",\"about\",\"project\",\"resume\"]",
                "",
                "{\"required\":[\"name\",\"title\",\"about\",\"about_extended\",\"skills\",\"location\",\"tools_list\",\"avatar_url\",\"resume_url\",\"personal_quote\"],\"contact\":[\"contact_github\",\"contact_twitter\",\"contact_linkedin\",\"contact_instagram\"],\"experience\":[\"exp_count\",\"exp_N_company\",\"exp_N_role\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_github_url\",\"project_N_image_url\",\"project_N_is_blog\"],\"education\":[\"edu_count\",\"edu_N_degree\",\"edu_N_institution\"],\"blogs\":[\"blog_count\",\"blog_N_url\"],\"ai_keys\":[\"about_extended\",\"personal_quote\",\"seo_title\",\"seo_description\"]}",
                "{\"min_skills\":3,\"requires_experience\":false,\"requires_projects\":true,\"requires_blogs\":false,\"requires_testimonials\":false,\"best_for\":\"developers with a strong project portfolio and downloadable resume\",\"score_weights\":{\"has_experience\":1,\"has_projects\":4,\"has_testimonials\":0,\"has_blogs\":0.5,\"skill_count\":0.8,\"exp_count\":0.5,\"project_count\":2}}",
                5
            );

            seedTemplate(
                "developer_spline_showcase",
                "Developer Spline Showcase",
                "developer",
                "single",
                "free",
                "{}",
                "[\"home\",\"about\",\"projects\",\"services\",\"contact\"]",
                "",
                "{\"required\":[\"name\",\"title\",\"about\",\"about_extended\",\"hero_headline\",\"tagline\",\"cta_primary\",\"cta_secondary\",\"skills\",\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\",\"years_experience\",\"seo_title\",\"seo_description\"],\"contact\":[\"contact_email\",\"contact_linkedin\",\"contact_github\",\"contact_twitter\"],\"experience\":[\"exp_count\",\"exp_N_company\",\"exp_N_role\",\"exp_N_duration\",\"exp_N_description\",\"exp_N_highlight\"],\"projects\":[\"project_count\",\"project_N_name\",\"project_N_description\",\"project_N_tech\",\"project_N_live_url\",\"project_N_github_url\",\"project_N_image_url\"],\"ai_keys\":[\"about_extended\",\"hero_headline\",\"tagline\",\"cta_primary\",\"cta_secondary\",\"seo_title\",\"seo_description\",\"years_experience\"]}",
                "{\"min_skills\":2,\"requires_experience\":false,\"requires_projects\":true,\"requires_blogs\":false,\"requires_testimonials\":false,\"best_for\":\"developers who want a bold one-page showcase with strong project highlights\",\"score_weights\":{\"has_experience\":2,\"has_projects\":4,\"has_testimonials\":0,\"has_blogs\":0,\"skill_count\":1,\"exp_count\":1,\"project_count\":2}}",
                6
            );

        normalizeTemplatePlansForTesting();

        log.info("Templates seeded");
    }

    private void normalizeTemplatePlansForTesting() {
        var templates = templateRepository.findAll();
        boolean changed = false;
        for (Template t : templates) {
            boolean shouldBeActive = IMPLEMENTED_TEMPLATE_IDS.contains(t.getId());
            if (!Boolean.valueOf(shouldBeActive).equals(t.getIsActive())) {
                t.setIsActive(shouldBeActive);
                changed = true;
            }
            if (!"free".equalsIgnoreCase(t.getRequiredPlan())) {
                t.setRequiredPlan("free");
                changed = true;
            }
        }
        if (changed) {
            templateRepository.saveAll(templates);
            log.info("Template plan normalization applied: all active templates set to free");
        }
    }

    private void seedTemplate(
            String id,
            String name,
            String category,
            String templateType,
            String requiredPlan,
            String components,
            String pages,
            String cssCode,
            String placeholderSchema,
            String selectionRules,
            int sortOrder
    ) {
        if (templateRepository.existsById(id)) {
            return;
        }

        Template template = Template.builder()
                .id(id)
                .name(name)
                .category(category)
                .templateType(templateType)
                .requiredPlan(requiredPlan)
                .components(components)
                .pages(pages)
                .cssCode(cssCode)
                .placeholderSchema(placeholderSchema)
                .selectionRules(selectionRules)
                .isActive(true)
                .sortOrder(sortOrder)
                .build();

        templateRepository.save(template);
        log.info("Seeded template: {}", id);
    }

    private void seedAdminUser() {
        // Email is unique in DB. If any row exists (even soft-deleted), skip seeding to avoid startup crash.
        if (userRepository.existsByEmail(adminEmail)) {
            return;
        }

        User admin = User.builder()
                .id(UUID.randomUUID())
                .name("Portiva Admin")
                .email(adminEmail)
                .passwordHash(passwordEncoder.encode(adminPassword))
                .role("admin")
                .emailVerified(true)
                .isNewUser(false)
                .aiGenCount(0)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        userRepository.save(admin);
        log.info("Admin user seeded: {}", adminEmail);
    }
}
