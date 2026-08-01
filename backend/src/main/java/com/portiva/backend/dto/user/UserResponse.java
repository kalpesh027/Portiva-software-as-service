package com.portiva.backend.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String title;
    private String avatar;
    private String location;
    private String website;
    private Map<String, Object> subscription;
    private String createdAt;
    private Boolean emailVerified;
    private Boolean isNewUser;
}
