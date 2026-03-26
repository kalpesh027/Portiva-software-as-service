package com.portiva.backend.controller;

import com.portiva.backend.dto.template.TemplateResponseDTO;
import com.portiva.backend.service.TemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Template controller — GET /templates (public, no auth)
 * Templates are public so pricing/landing pages can show previews without login.
 *
 * Returns template data with UI metadata (color, description, features, preview images).
 * Template CRUD is in AdminController (admin-only).
 */
@RestController
@RequestMapping("/templates")
@RequiredArgsConstructor
public class TemplateController {

    private final TemplateService templateService;

    /** GET /templates — all active templates with UI metadata and images, ordered by sortOrder */
    @GetMapping
    public ResponseEntity<List<TemplateResponseDTO>> getAll() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    /** GET /templates/{id} — single template with UI metadata and images */
    @GetMapping("/{id}")
    public ResponseEntity<TemplateResponseDTO> getById(@PathVariable String id) {
        return ResponseEntity.ok(templateService.getTemplateById(id));
    }
}
