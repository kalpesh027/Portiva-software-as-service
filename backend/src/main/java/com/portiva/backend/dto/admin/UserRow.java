package com.portiva.backend.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRow {
    private String id;
    private String name;
    private String email;
    private String role;
    private String plan;
    private Boolean emailVerified;
    private String createdAt;
}
