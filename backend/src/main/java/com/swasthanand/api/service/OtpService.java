package com.swasthanand.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.security.SecureRandom;
import java.time.Duration;
import java.util.concurrent.ConcurrentHashMap;

/**
 * OTP service that generates, stores, and verifies one-time passwords.
 *
 * <p><b>Storage:</b> OTPs are held in an in-process {@link ConcurrentHashMap}.
 * Each entry carries its own expiry timestamp so that stale codes are rejected
 * at verification time without needing an external scheduler.</p>
 *
 * <p><b>No Redis required:</b> This implementation has zero external
 * dependencies — it works in any local development environment without Docker,
 * Redis, or any network service.</p>
 *
 * <p><b>Thread safety:</b> {@link ConcurrentHashMap} guarantees atomic
 * put/remove operations. {@link SecureRandom} is also thread-safe. No
 * additional synchronisation is needed.</p>
 *
 * <p><b>OTP lifetime:</b> 5 minutes from the moment of generation. A new call
 * to {@link #generateOtp} for the same phone number overwrites the previous
 * entry.</p>
 */
@Service
@Slf4j
public class OtpService {

    /** How long a generated OTP remains valid. */
    private static final Duration OTP_TTL = Duration.ofMinutes(5);

    /** Cryptographically strong, thread-safe random number generator. */
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    /**
     * In-memory OTP store: phone → OtpEntry.
     * ConcurrentHashMap provides thread-safe reads and writes.
     */
    private final ConcurrentHashMap<String, OtpEntry> otpStore = new ConcurrentHashMap<>();

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    /**
     * Generates a fresh 6-digit OTP for the given phone number, stores it
     * in memory with a 5-minute expiry, and returns the code so the caller
     * can deliver it via SMS.
     *
     * <p>Calling this method again before the previous OTP expires simply
     * overwrites the old entry — only the latest OTP is ever valid.</p>
     *
     * @param phone the recipient's phone number
     * @return a {@link Mono} emitting the generated 6-digit OTP string
     */
    public Mono<String> generateOtp(String phone) {
        return Mono.fromCallable(() -> {
            String otp = generateSixDigitOtp();
            String key  = normalise(phone);

            otpStore.put(key, new OtpEntry(otp));

            log.info("[OTP-GEN] Generated OTP for phone={}  |  expires in {}",
                    maskPhone(phone), OTP_TTL);

            return otp;
        });
    }

    /**
     * Verifies whether {@code code} matches the OTP stored for {@code phone}.
     *
     * <ul>
     *   <li>Returns {@code true} and immediately removes the entry on a match
     *       so the OTP cannot be reused.</li>
     *   <li>Returns {@code false} for a wrong code, an expired entry, a missing
     *       entry, or a null/blank input.</li>
     * </ul>
     *
     * @param phone the phone number submitted by the client
     * @param code  the OTP submitted by the client
     * @return a {@link Mono} emitting {@code true} on success, {@code false} otherwise
     */
    public Mono<Boolean> verifyOtp(String phone, String code) {
        return Mono.fromCallable(() -> {
            log.info("[OTP-VERIFY] Verification attempt for phone={}", maskPhone(phone));

            if (code == null || code.isBlank()) {
                log.warn("[OTP-VERIFY] Received null or blank OTP for phone={}", maskPhone(phone));
                return false;
            }

            String key   = normalise(phone);
            OtpEntry entry = otpStore.get(key);

            boolean matches = entry != null && entry.otp.equals(code.trim());

            if (matches) {
                otpStore.remove(key); // one-time use — delete immediately after success
                log.info("[OTP-VERIFY] OTP verified successfully for phone={}", maskPhone(phone));
            } else if (entry == null) {
                log.warn("[OTP-VERIFY] No OTP found for phone={} — never issued or already used", maskPhone(phone));
                return false;
            } else if (entry.isExpired()) {
                otpStore.remove(key);
                log.warn("[OTP-VERIFY] OTP expired for phone={}", maskPhone(phone));
                return false;
            } else {
                log.warn("[OTP-VERIFY] Invalid OTP supplied for phone={}", maskPhone(phone));
            }

            return matches;
        });
    }

    // -----------------------------------------------------------------------
    // Internal helpers
    // -----------------------------------------------------------------------

    /**
     * Produces a zero-padded 6-digit OTP string (e.g. {@code "047382"}).
     * Range is [000000, 999999].
     */
    private String generateSixDigitOtp() {
        return String.format("%06d", SECURE_RANDOM.nextInt(1_000_000));
    }

    /**
     * Normalises a phone number to a consistent map key by stripping
     * leading/trailing whitespace.
     */
    private String normalise(String phone) {
        return phone == null ? "" : phone.trim();
    }

    /**
     * Masks a phone number for safe log output (shows only the last 2 digits).
     * e.g. {@code "9284939947"} → {@code "********47"}
     */
    private String maskPhone(String phone) {
        if (phone == null || phone.length() <= 2) return "****";
        return "*".repeat(phone.length() - 2) + phone.substring(phone.length() - 2);
    }

    // -----------------------------------------------------------------------
    // Inner class — OTP entry with embedded expiry
    // -----------------------------------------------------------------------

    /**
     * Immutable value object holding a single OTP and its expiry epoch millis.
     * Constructed once at generation time; never mutated afterwards.
     */
    private static final class OtpEntry {

        private final String otp;
        private final long   expiryEpochMillis;

        OtpEntry(String otp) {
            this.otp               = otp;
            this.expiryEpochMillis = System.currentTimeMillis() + OTP_TTL.toMillis();
        }

        /** Returns {@code true} if the current wall-clock time is past the expiry. */
        boolean isExpired() {
            return System.currentTimeMillis() > expiryEpochMillis;
        }
    }
}
