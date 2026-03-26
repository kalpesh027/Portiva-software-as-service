package com.portiva.backend.dto.portfolio;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

/**
 * Portfolio response — wraps the portfolio object.
 * Matches frontend expectation: { portfolio: { id, name, slug, templateName,
 *   placeholderMap, status, liveUrl, createdAt, updatedAt } }
 */
@Data
@AllArgsConstructor
public class PortfolioResponse {
    private Map<String, Object> portfolio;
}
