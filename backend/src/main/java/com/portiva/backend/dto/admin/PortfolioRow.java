package com.portiva.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioRow {
    private String id;
    private String userEmail;
    private String slug;
    private String templateName;
    private String status;
    private String aiStatus;
    private Long views;
    private String createdAt;
    private String deletedAt;
}
