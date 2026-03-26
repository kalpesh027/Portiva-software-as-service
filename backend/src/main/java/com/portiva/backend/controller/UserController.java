package com.portiva.backend.controller;

import com.portiva.backend.dto.auth.MessageResponse;
import com.portiva.backend.dto.user.UpdatePasswordRequest;
import com.portiva.backend.dto.user.UpdateProfileRequest;
import com.portiva.backend.dto.user.UserResponse;
import com.portiva.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

/**
 * User controller — /user/**
 *
 * GET    /user/profile
 * PUT    /user/profile
 * PUT    /user/password
 * DELETE /user/account
 */
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    /** GET /user/profile */
    @GetMapping("/profile")
    public ResponseEntity<UserResponse> getProfile(@AuthenticationPrincipal UUID userId) {
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    /** PUT /user/profile — {name, title, avatar, location, website} */
    @PutMapping("/profile")
    public ResponseEntity<UserResponse> updateProfile(
            @AuthenticationPrincipal UUID userId,
            @RequestBody UpdateProfileRequest req
    ) {
        return ResponseEntity.ok(userService.updateProfile(userId, req));
    }

    /** PUT /user/password — {currentPassword, newPassword} */
    @PutMapping("/password")
    public ResponseEntity<MessageResponse> updatePassword(
            @AuthenticationPrincipal UUID userId,
            @Valid @RequestBody UpdatePasswordRequest req
    ) {
        userService.updatePassword(userId, req);
        return ResponseEntity.ok(new MessageResponse("Password updated successfully"));
    }

    /**
     * DELETE /user/account
     * Soft delete — sets deleted_at=now(). Not reversible by user.
     */
    @DeleteMapping("/account")
    public ResponseEntity<MessageResponse> deleteAccount(@AuthenticationPrincipal UUID userId) {
        userService.deleteAccount(userId);
        return ResponseEntity.ok(new MessageResponse("Account deleted successfully"));
    }
}
