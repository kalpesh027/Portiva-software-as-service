package com.portiva.backend.service;

import com.portiva.backend.repository.PortfolioRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Slug generation service.
 *
 * Algorithm:
 * 1. Normalize unicode (NFD form) → strip diacritics.
 * 2. Lowercase.
 * 3. Replace spaces with hyphens.
 * 4. Remove all non-alphanumeric/hyphen characters.
 * 5. Collapse multiple consecutive hyphens.
 * 6. Strip leading/trailing hyphens.
 * 7. Truncate to 50 chars.
 * 8. Check uniqueness in DB — append -2, -3, -N on conflict.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class SlugService {

    private static final int MAX_SLUG_LENGTH = 50;
    private static final Pattern NON_ALPHANUMERIC = Pattern.compile("[^a-z0-9\\-]");
    private static final Pattern MULTI_HYPHEN = Pattern.compile("-{2,}");
    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private final PortfolioRepository portfolioRepository;

    /**
     * Generate a unique URL-safe slug from a name string.
     * Handles conflicts by appending numeric suffix (-2, -3, ...).
     */
    public String generate(String name) {
        String base = toSlug(name);

        // Ensure base is not empty after normalization
        if (base.isBlank()) {
            base = "portfolio";
        }

        // Check uniqueness — try base first, then base-2, base-3, ...
        String candidate = base;
        int suffix = 2;

        while (portfolioRepository.findBySlugAndDeletedAtIsNull(candidate).isPresent()) {
            String suffixStr = "-" + suffix;
            // Trim base to fit suffix within max length
            int allowedBase = MAX_SLUG_LENGTH - suffixStr.length();
            candidate = base.substring(0, Math.min(base.length(), allowedBase)) + suffixStr;
            suffix++;

            if (suffix > 999) {
                // Safety valve — extremely unlikely
                candidate = base.substring(0, Math.min(base.length(), 40)) + "-" + System.currentTimeMillis();
                break;
            }
        }

        log.debug("Slug generated: input='{}' slug='{}'", name, candidate);
        return candidate;
    }

    /**
     * Preview slug from name without uniqueness check.
     * Used by the slug-availability endpoint — just normalise the name.
     */
    public String toSlugPreview(String name) {
        return toSlug(name);
    }

    private String toSlug(String input) {
        if (input == null || input.isBlank()) {
            return "portfolio";
        }

        // 1. Normalize unicode to NFD and strip combining diacritics (accents)
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String stripped = DIACRITICS.matcher(normalized).replaceAll("");

        // 2. Lowercase
        String lower = stripped.toLowerCase();

        // 3. Replace whitespace with hyphens
        String hyphenated = lower.replaceAll("\\s+", "-");

        // 4. Remove non-alphanumeric/hyphen characters
        String clean = NON_ALPHANUMERIC.matcher(hyphenated).replaceAll("");

        // 5. Collapse consecutive hyphens
        String collapsed = MULTI_HYPHEN.matcher(clean).replaceAll("-");

        // 6. Strip leading/trailing hyphens
        String trimmed = collapsed.replaceAll("^-+|-+$", "");

        // 7. Truncate to max length
        return trimmed.length() > MAX_SLUG_LENGTH
                ? trimmed.substring(0, MAX_SLUG_LENGTH)
                : trimmed;
    }
}
