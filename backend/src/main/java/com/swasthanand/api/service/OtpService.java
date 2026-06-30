package com.swasthanand.api.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class OtpService {

    @Value("${app.admin-debug-otp:false}")
    private boolean debugOtpEnabled;

    private static final String ADMIN_PHONE = "9284939947";
    private static final String DEBUG_OTP = "123456";

    private final ConcurrentHashMap<String, OtpData> otpStorage = new ConcurrentHashMap<>();

    private static final long OTP_VALID_DURATION = TimeUnit.MINUTES.toMillis(5);

    private static class OtpData {
        String code;
        long expiry;

        OtpData(String code) {
            this.code = code;
            this.expiry = System.currentTimeMillis() + OTP_VALID_DURATION;
        }

        boolean isExpired() {
            return System.currentTimeMillis() > expiry;
        }
    }

    public Mono<String> generateOtp(String phone) {
        return Mono.fromCallable(() -> {
            String code;
            if (debugOtpEnabled && ADMIN_PHONE.equals(phone)) {
                code = DEBUG_OTP;
            } else {
                Random random = new Random();
                code = String.format("%06d", random.nextInt(1000000));
            }
            otpStorage.put(phone, new OtpData(code));
            System.out.println(">>> Generated OTP for phone '" + phone + "' is: " + code);
            return code;
        });
    }

    public Mono<Boolean> verifyOtp(String phone, String code) {
        return Mono.fromCallable(() -> {
            System.out.println(">>> Verifying OTP for phone '" + phone + "' with code '" + code + "'");
            System.out.println(">>> Current keys in otpStorage: " + otpStorage.keySet());
            OtpData data = otpStorage.get(phone);
            if (data == null) {
                System.out.println(">>> No OTP data found for phone '" + phone + "'");
                return false;
            }
            if (data.isExpired()) {
                System.out.println(">>> OTP data for phone '" + phone + "' has expired");
                otpStorage.remove(phone);
                return false;
            }

            boolean isValid = data.code.equals(code);
            System.out.println(">>> Verification result: " + isValid + " (stored: '" + data.code + "', entered: '" + code + "')");
            if (isValid) {
                otpStorage.remove(phone); // Clear after successful use
            }
            return isValid;
        });
    }
}
