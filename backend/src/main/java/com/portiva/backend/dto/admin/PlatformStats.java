package com.portiva.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlatformStats {
    private Long totalUsers;
    private Long activeUsers30d;
    private Long totalPortfolios;
    private Long publishedPortfolios;
    private Double totalRevenueInr;
    private Double monthlyRevenueInr;
    private PlanBreakdown planBreakdown;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class PlanBreakdown {
        private Long free;
        private Long pro;
        private Long team;
    }
}
