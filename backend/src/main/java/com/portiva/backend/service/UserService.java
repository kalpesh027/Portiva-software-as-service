package com.portiva.backend.service;

import com.portiva.backend.dto.auth.*;
import com.portiva.backend.dto.user.UpdatePasswordRequest;
import com.portiva.backend.dto.user.UpdateProfileRequest;
import com.portiva.backend.dto.user.UserResponse;
import com.portiva.backend.entity.Subscription;
import com.portiva.backend.entity.User;
import com.portiva.backend.exception.ForbiddenException;
import com.portiva.backend.exception.ResourceNotFoundException;
import com.portiva.backend.exception.UnauthorizedException;
import com.portiva.backend.repository.SubscriptionRepository;
import com.portiva.backend.repository.UserRepository;
import com.portiva.backend.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;
    private final EmailService emailService;

    /**
     * Register — saves user, creates free subscription, sends OTP.
     * Returns immediately with {message} — does NOT issue JWT yet.
     * JWT issued only after OTP verification.
     */
    @Transactional
    public MessageResponse register(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new ForbiddenException("An account with this email already exists.");
        }

        User user = User.builder()
                .name(name)
                .email(email)
                .passwordHash(passwordEncoder.encode(password))
                .role("user")
                .emailVerified(false)
                .isNewUser(true)
                .aiGenCount(0)
                .build();

        user = userRepository.save(user);

        // Create free subscription immediately
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan("free")
                .status("inactive")
                .build();
        subscriptionRepository.save(subscription);

        // Generate and send OTP
        String otp = otpService.generate();
        otpService.store(user, otp);
        emailService.sendOtpEmail(email, name, otp);

        log.info("User registered: email={} userId={}", email, user.getId());
        return new MessageResponse("OTP sent to your email");
    }

    /**
     * Verify OTP — sets email_verified=true, issues JWT.
     * Returns {token, user} — same shape as login response.
     */
    @Transactional
    public AuthResponse verifyOtp(String email, String otp) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!otpService.verify(email, otp)) {
            throw new UnauthorizedException("Invalid or expired OTP");
        }

        user.setEmailVerified(true);
        userRepository.save(user);

        // Send welcome email async
        emailService.sendWelcomeEmail(email, user.getName());

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        log.info("OTP verified, JWT issued: userId={}", user.getId());

        return buildAuthResponse(token, user);
    }

    /**
     * Login — checks email_verified, validates password, issues JWT.
     */
    @Transactional(readOnly = true)
    public AuthResponse login(String email, String password) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        // REMOVED check for email verified according to requirements:
        // Users can now login even if not verified yet, and will be prompted in dashboard.

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            log.warn("Login failed — wrong password: email={}", email);
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtUtil.generateToken(user.getId(), user.getRole());
        log.info("Login successful: userId={}", user.getId());

        return buildAuthResponse(token, user);
    }

    /**
     * Resend OTP — generates new OTP and sends email.
     * Previous OTP is overwritten.
     */
    @Transactional
    public MessageResponse resendOtp(String email) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return new MessageResponse("Your email is already verified");
        }

        String otp = otpService.generate();
        otpService.store(user, otp);
        emailService.sendOtpEmail(email, user.getName(), otp);

        log.info("OTP resent: email={}", email);
        return new MessageResponse("OTP resent to your email");
    }

    /**
     * Get profile — returns user object matching frontend shape.
     */
    @Transactional(readOnly = true)
    public UserResponse getProfile(UUID userId) {
        User user = findActiveUser(userId);
        return buildUserResponse(user);
    }

    /**
     * Update profile — only updates provided non-null fields.
     */
    @Transactional
    public UserResponse updateProfile(UUID userId, UpdateProfileRequest req) {
        User user = findActiveUser(userId);

        if (req.getName() != null) user.setName(req.getName());
        if (req.getTitle() != null) user.setTitle(req.getTitle());
        if (req.getAvatar() != null) user.setAvatar(req.getAvatar());
        if (req.getLocation() != null) user.setLocation(req.getLocation());
        if (req.getWebsite() != null) user.setWebsite(req.getWebsite());

        userRepository.save(user);
        log.info("Profile updated: userId={}", userId);
        return buildUserResponse(user);
    }

    /**
     * Update password — verifies current password before changing.
     */
    @Transactional
    public void updatePassword(UUID userId, UpdatePasswordRequest req) {
        User user = findActiveUser(userId);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
        log.info("Password updated: userId={}", userId);
    }

    /**
     * Delete account — soft delete only. Sets deleted_at = now().
     * Never hard deletes.
     */
    @Transactional
    public void deleteAccount(UUID userId) {
        User user = findActiveUser(userId);
        user.setDeletedAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("Account soft-deleted: userId={}", userId);
    }

    // ===== HELPERS =====

    public User findActiveUser(UUID userId) {
        return userRepository.findById(userId)
                .filter(u -> u.getDeletedAt() == null)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public AuthResponse buildAuthResponse(String token, User user) {
        Subscription sub = subscriptionRepository.findByUserId(user.getId())
                .orElse(null);

        Map<String, Object> subscriptionMap = sub != null
                ? Map.of("plan", sub.getPlan(), "status", sub.getStatus())
                : Map.of("plan", "free", "status", "inactive");

        Map<String, Object> userMap = Map.of(
                "id", user.getId().toString(),
                "name", user.getName(),
                "email", user.getEmail(),
                "title", user.getTitle() != null ? user.getTitle() : "",
                "avatar", user.getAvatar() != null ? user.getAvatar() : "",
                "subscription", subscriptionMap,
                "createdAt", user.getCreatedAt().toString(),
                "isNewUser", user.getIsNewUser()
        );

        return new AuthResponse(token, userMap);
    }

    public UserResponse buildUserResponse(User user) {
        Subscription sub = subscriptionRepository.findByUserId(user.getId()).orElse(null);
        Map<String, Object> subscriptionMap = sub != null
                ? Map.of("plan", sub.getPlan(), "status", sub.getStatus())
                : Map.of("plan", "free", "status", "inactive");

        return UserResponse.builder()
                .id(user.getId().toString())
                .name(user.getName())
                .email(user.getEmail())
                .title(user.getTitle())
                .avatar(user.getAvatar())
                .location(user.getLocation())
                .website(user.getWebsite())
                .subscription(subscriptionMap)
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt().toString() : null)
                .build();
    }
}
