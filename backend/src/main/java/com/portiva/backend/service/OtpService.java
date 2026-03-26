package com.portiva.backend.service;

import com.portiva.backend.entity.User;
import com.portiva.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * OTP service — secure 6-digit OTP generation, storage, and verification.
 *
 * SECURITY:
 * - Uses SecureRandom (not Random) for cryptographically secure codes.
 * - OTP cleared from DB immediately on successful verification.
 * - Expiry enforced at verification time.
 * - Zero-pads to always produce 6 digits (e.g. 000123).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 10;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final UserRepository userRepository;

    /**
     * Generate a cryptographically secure 6-digit OTP string.
     * Zero-padded to always be 6 characters.
     */
    public String generate() {
        int code = SECURE_RANDOM.nextInt(1_000_000); // 0 to 999999
        return String.format("%06d", code);
    }

    /**
     * Store OTP on the user record with a 10-minute expiry timestamp.
     */
    @Transactional
    public void store(User user, String otp) {
        user.setOtp(otp);
        user.setOtpExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        userRepository.save(user);
        log.debug("OTP stored for user: email={}", user.getEmail());
    }

    /**
     * Verify the provided OTP against the stored value.
     *
     * Checks:
     * 1. User exists and has an OTP stored.
     * 2. Provided OTP matches stored OTP.
     * 3. OTP has not expired.
     * 4. Clears OTP from DB on success (single-use).
     *
     * @return true if OTP is valid and not expired, false otherwise.
     */
    @Transactional
    public boolean verify(String email, String providedOtp) {
        User user = userRepository.findByEmailAndDeletedAtIsNull(email)
                .orElse(null);

        if (user == null || user.getOtp() == null || user.getOtpExpiresAt() == null) {
            log.warn("OTP verification failed — no OTP stored: email={}", email);
            return false;
        }

        if (!user.getOtp().equals(providedOtp)) {
            log.warn("OTP verification failed — mismatch: email={}", email);
            return false;
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiresAt())) {
            log.warn("OTP verification failed — expired: email={}", email);
            // Clear expired OTP
            clearOtp(user);
            return false;
        }

        // Success — clear OTP immediately (single-use)
        clearOtp(user);
        log.info("OTP verified successfully: email={}", email);
        return true;
    }

    private void clearOtp(User user) {
        user.setOtp(null);
        user.setOtpExpiresAt(null);
        userRepository.save(user);
    }
}
