package com.portiva.backend.dto.portfolio;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Analytics response.
 * Free plan: only views populated.
 * Pro/Team: all fields populated.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    private Long views;
    private Long uniqueVisitors;
    private Map<String, Long> countries;
    private List<Map<String, Object>> timeline;
}
