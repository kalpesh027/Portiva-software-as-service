package com.portiva.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String title;
    private String avatar;
    private String location;
    private String website;
    private Boolean emailVerified;
    private Integer aiGenCount;
    private String plan;
    private String subscriptionStatus;
    private String portfolioSlug;
    private String deletedAt;
    private String createdAt;
}
