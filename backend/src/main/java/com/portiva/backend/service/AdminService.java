package com.portiva.backend.service;

import com.portiva.backend.dto.admin.*;
import com.portiva.backend.entity.Portfolio;
import com.portiva.backend.entity.Template;
import com.portiva.backend.entity.User;
import com.portiva.backend.exception.ForbiddenException;
import com.portiva.backend.exception.ResourceNotFoundException;
import com.portiva.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final PortfolioRepository portfolioRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final TemplateRepository templateRepository;
    private final PaymentOrderRepository paymentOrderRepository;

    /**
     * Pageable list of all users — supports search by name or email.
     */
    @Transactional(readOnly = true)
    public Page<UserRow> getUsers(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Page<User> users = (search != null && !search.isBlank())
                ? userRepository.searchActiveUsers(search, pageable)
                : userRepository.findAllByDeletedAtIsNull(pageable);

        return users.map(user -> {
            var sub = subscriptionRepository.findByUserId(user.getId()).orElse(null);
            return UserRow.builder()
                    .id(user.getId().toString())
                    .name(user.getName())
                    .email(user.getEmail())
                    .role(user.getRole())
                    .plan(sub != null ? sub.getPlan() : "free")
                    .emailVerified(user.getEmailVerified())
                    .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                    .build();
        });
    }

    /**
     * Get full user detail — for admin user detail page.
     */
    @Transactional(readOnly = true)
    public UserDetailResponse getUserDetail(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        var sub = subscriptionRepository.findByUserId(userId).orElse(null);
        var portfolio = portfolioRepository.findByUserIdAndDeletedAtIsNull(userId).orElse(null);

        return UserDetailResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .title(user.getTitle())
                .avatar(user.getAvatar())
                .location(user.getLocation())
                .website(user.getWebsite())
                .emailVerified(user.getEmailVerified())
                .aiGenCount(user.getAiGenCount())
                .plan(sub != null ? sub.getPlan() : "free")
                .subscriptionStatus(sub != null ? sub.getStatus() : "inactive")
                .portfolioSlug(portfolio != null ? portfolio.getSlug() : null)
                .deletedAt(user.getDeletedAt() != null ? user.getDeletedAt().toString() : null)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }

    /**
     * Soft delete user — admin cannot delete themselves.
     */
    @Transactional
    public void deleteUser(UUID adminId, UUID targetUserId) {
        if (adminId.equals(targetUserId)) {
            throw new ForbiddenException("Cannot delete your own admin account");
        }

        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Admin deleted user: adminId={} targetUserId={}", adminId, targetUserId);
    }

    /**
     * Pageable list of all portfolios for admin overview.
     */
    @Transactional(readOnly = true)
    public Page<PortfolioRow> getPortfolios(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return portfolioRepository.findAll(pageable).map(p -> PortfolioRow.builder()
                .id(p.getId().toString())
                .userEmail(p.getUser().getEmail())
                .slug(p.getSlug())
                .templateName(p.getTemplateName())
                .status(p.getStatus())
                .aiStatus(p.getAiStatus())
                .views(p.getViews())
                .createdAt(p.getCreatedAt() != null ? p.getCreatedAt().toString() : null)
                .deletedAt(p.getDeletedAt() != null ? p.getDeletedAt().toString() : null)
                .build());
    }

    /**
     * Platform statistics for admin dashboard.
     *
     * Plan breakdown uses JPQL @Query — O(1) DB aggregation, not O(n) in-memory stream.
     * Revenue: paise → INR (divide by 100). Monthly uses first-of-month cutoff.
     */
    @Transactional(readOnly = true)
    public PlatformStats getStats() {
        long totalUsers = userRepository.countByDeletedAtIsNull();

        // Pass cutoff explicitly — JPQL date arithmetic is non-portable
        long activeUsers30d = userRepository.countActiveUsersLast30Days(
                LocalDateTime.now().minusDays(30));

        long totalPortfolios = portfolioRepository.countByDeletedAtIsNull();
        long publishedPortfolios = portfolioRepository.countByStatusAndDeletedAtIsNull("published");

        // Revenue in paise → divide by 100 for INR
        long totalRevenuePaise = paymentOrderRepository.sumPaidAmounts();

        // Current calendar month: always start at 00:00:00 on day 1
        LocalDateTime startOfMonth = LocalDateTime.now()
                .withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        long monthlyRevenuePaise = paymentOrderRepository.sumPaidAmountsThisMonth(startOfMonth);

        // JPQL count queries — single DB call each, no full table scan
        long proCount  = subscriptionRepository.countActivePlan("pro");
        long teamCount = subscriptionRepository.countActivePlan("team");
        long freeCount = totalUsers - proCount - teamCount;

        return PlatformStats.builder()
                .totalUsers(totalUsers)
                .activeUsers30d(activeUsers30d)
                .totalPortfolios(totalPortfolios)
                .publishedPortfolios(publishedPortfolios)
                .totalRevenueInr(totalRevenuePaise / 100.0)
                .monthlyRevenueInr(monthlyRevenuePaise / 100.0)
                .planBreakdown(new PlatformStats.PlanBreakdown(freeCount, proCount, teamCount))
                .build();
    }

    // ===== TEMPLATE CRUD =====

    @Transactional(readOnly = true)
    public List<Template> getAllTemplates() {
        return templateRepository.findByIsActiveTrueOrderBySortOrderAsc();
    }

    @Transactional
    public Template createTemplate(Template template) {
        return templateRepository.save(template);
    }

    @Transactional
    public Template updateTemplate(String templateId, Template updates) {
        Template existing = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));

        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getTemplateType() != null) existing.setTemplateType(updates.getTemplateType());
        if (updates.getComponents() != null) existing.setComponents(updates.getComponents());
        if (updates.getPages() != null) existing.setPages(updates.getPages());
        if (updates.getCssCode() != null) existing.setCssCode(updates.getCssCode());
        if (updates.getPreviewImage() != null) existing.setPreviewImage(updates.getPreviewImage());
        if (updates.getRequiredPlan() != null) existing.setRequiredPlan(updates.getRequiredPlan());
        if (updates.getIsActive() != null) existing.setIsActive(updates.getIsActive());
        if (updates.getSortOrder() != null) existing.setSortOrder(updates.getSortOrder());

        return templateRepository.save(existing);
    }

    @Transactional
    public void deleteTemplate(String templateId) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found"));
        // Soft-deactivate rather than delete — preserve historical references
        template.setIsActive(false);
        templateRepository.save(template);
        log.info("Template deactivated: templateId={}", templateId);
    }
}
