package com.portiva.backend.controller;

import com.portiva.backend.dto.auth.*;
import com.portiva.backend.dto.user.UserResponse;
import com.portiva.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * Auth controller — POST /auth/**
 * All endpoints are public (no JWT required) except GET /auth/me.
 */
@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;

    /** POST /auth/register — {name,email,password} → {message} */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(@Valid @RequestBody RegisterRequest req) {
        return ResponseEntity.ok(userService.register(req.getName(), req.getEmail(), req.getPassword()));
    }

    /** POST /auth/verify-otp — {email,otp} → {token,user} */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        return ResponseEntity.ok(userService.verifyOtp(req.getEmail(), req.getOtp()));
    }

    /** POST /auth/resend-otp — {email} → {message} */
    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        return ResponseEntity.ok(userService.resendOtp(req.getEmail()));
    }

    /** POST /auth/login — {email,password} → {token,user} */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(userService.login(req.getEmail(), req.getPassword()));
    }

    /**
     * POST /auth/logout — server-side logout.
     * JWT is stateless — actual invalidation handled by frontend clearing localStorage.
     * Endpoint exists for completeness and future token blacklist support.
     */
    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout() {
        return ResponseEntity.ok(new MessageResponse("Logged out successfully"));
    }

    /**
     * POST /auth/promote-admin — development-only endpoint.
     * Requires devKey header for security. Use only in dev/testing.
     * {email} → promotes user to admin role.
     */
    @PostMapping("/promote-admin")
    public ResponseEntity<?> promoteToAdmin(
            @RequestHeader(value = "X-Dev-Key", required = false) String devKey,
            @RequestBody Map<String, String> payload
    ) {
        // Simple dev-only protection: accept requests with X-Dev-Key header
        if (!"dev-unlock-2024".equals(devKey)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access denied"));
        }
        
        String email = payload.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("Email is required"));
        }
        
        try {
            userService.promoteToAdmin(email);
            return ResponseEntity.ok(new MessageResponse("User promoted to admin: " + email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * POST /auth/setup-admin — development-only endpoint.
     * CREATE admin user directly for testing (bypasses OTP/email verification).
     * Requires devKey header.
     * {email,password,name} → creates verified admin user, returns {token,user}
     */
    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(
            @RequestHeader(value = "X-Dev-Key", required = false) String devKey,
            @RequestBody Map<String, String> payload
    ) {
        if (!"dev-unlock-2024".equals(devKey)) {
            return ResponseEntity.status(403).body(new MessageResponse("Access denied"));
        }
        
        String email = payload.get("email");
        String password = payload.get("password");
        String name = payload.get("name");
        
        if (email == null || password == null || name == null || 
            email.trim().isEmpty() || password.trim().isEmpty() || name.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new MessageResponse("email, password, and name are required"));
        }
        
        try {
            var response = userService.createAdminUser(email, password, name);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /** GET /auth/me — returns current user's profile */
    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }
}
