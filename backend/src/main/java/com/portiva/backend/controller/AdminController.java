package com.portiva.backend.controller;

import com.portiva.backend.dto.admin.*;
import com.portiva.backend.entity.Template;
import com.portiva.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Admin controller — /admin/**
 * REQUIRES role ADMIN — enforced at class level AND via JWT role claim.
 * All endpoints additionally protected by SecurityConfig matchers.
 */
@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /** GET /admin/users?page=0&size=20&search= */
    @GetMapping("/users")
    public ResponseEntity<Page<UserRow>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(adminService.getUsers(page, size, search));
    }

    /** GET /admin/users/{id} */
    @GetMapping("/users/{id}")
    public ResponseEntity<UserDetailResponse> getUserDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(adminService.getUserDetail(id));
    }

    /** DELETE /admin/users/{id} — soft delete, cannot delete self */
    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @AuthenticationPrincipal UUID adminId,
            @PathVariable UUID id
    ) {
        adminService.deleteUser(adminId, id);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully"));
    }

    /** GET /admin/portfolios?page=0&size=20 */
    @GetMapping("/portfolios")
    public ResponseEntity<Page<PortfolioRow>> getPortfolios(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(adminService.getPortfolios(page, size));
    }

    /** GET /admin/stats */
    @GetMapping("/stats")
    public ResponseEntity<PlatformStats> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    // ===== TEMPLATE CRUD =====

    /** POST /admin/templates */
    @PostMapping("/templates")
    public ResponseEntity<Template> createTemplate(@RequestBody Template template) {
        return ResponseEntity.ok(adminService.createTemplate(template));
    }

    /** PUT /admin/templates/{id} */
    @PutMapping("/templates/{id}")
    public ResponseEntity<Template> updateTemplate(
            @PathVariable String id,
            @RequestBody Template updates
    ) {
        return ResponseEntity.ok(adminService.updateTemplate(id, updates));
    }

    /** DELETE /admin/templates/{id} — soft deactivates, not hard delete */
    @DeleteMapping("/templates/{id}")
    public ResponseEntity<Map<String, String>> deleteTemplate(@PathVariable String id) {
        adminService.deleteTemplate(id);
        return ResponseEntity.ok(Map.of("message", "Template deactivated successfully"));
    }
}
