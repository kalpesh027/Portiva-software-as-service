package com.portiva.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Map;

/**
 * Auth response — matches frontend expectation exactly:
 * { token: string, user: { id, name, email, title, avatar, subscription, createdAt, isNewUser } }
 */
@Data
@AllArgsConstructor
public class AuthResponse {
    private String token;
    private Map<String, Object> user;
}
