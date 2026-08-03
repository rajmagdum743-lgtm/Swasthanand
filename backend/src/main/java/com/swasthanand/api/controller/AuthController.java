package com.swasthanand.api.controller;

import com.swasthanand.api.model.User;
import com.swasthanand.api.service.UserService;
import com.swasthanand.api.service.OtpService;
import com.swasthanand.api.service.SmsService;
import com.swasthanand.api.dto.OtpRequest;
import com.swasthanand.api.dto.OtpVerifyRequest;
import com.swasthanand.api.security.JwtUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final OtpService otpService;
    private final SmsService smsService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UserService userService, OtpService otpService, SmsService smsService, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userService = userService;
        this.otpService = otpService;
        this.smsService = smsService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    /**
     * Step 1 of OTP login: generate and dispatch a fresh OTP.
     *
     * <p>The SMS delivery is a potentially blocking Twilio HTTP call, so it is
     * executed on the bounded-elastic scheduler to avoid blocking the event loop.</p>
     *
     * <p>Sample request:
     * <pre>POST /api/auth/request-otp
     * { "phone": "9284939947" }</pre>
     * Sample success response (200):
     * <pre>{ "success": true, "message": "OTP sent successfully" }</pre>
     */
    @PostMapping("/request-otp")
    public Mono<ResponseEntity<Object>> requestOtp(@jakarta.validation.Valid @RequestBody OtpRequest request) {
        String phone = request.getPhone();

        if (phone == null || phone.isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                    .body((Object) Map.of("success", false, "message", "Phone number is required")));
        }

        log.info("[AUTH] OTP request received for phone={}", maskPhone(phone));

        return otpService.generateOtp(phone)
                .doOnSuccess(code ->
                        // Fire-and-forget: SMS dispatch is non-critical to the HTTP response.
                        // sendOtpReactive() internally offloads the blocking Twilio call to boundedElastic.
                        smsService.sendOtpReactive(phone, code)
                                .subscribe(
                                        v -> log.info("[AUTH] OTP SMS dispatched for phone={}", maskPhone(phone)),
                                        err -> log.error("[AUTH] SMS dispatch failed for phone={}: {}", maskPhone(phone), err.getMessage())
                                )
                )
                .map(code -> ResponseEntity.ok((Object) Map.of("success", true, "message", "OTP sent successfully")))
                .onErrorResume(err -> {
                    log.error("[AUTH] Failed to generate OTP for phone={}: {}", maskPhone(phone), err.getMessage(), err);
                    return Mono.just(ResponseEntity.internalServerError()
                            .body((Object) Map.of("success", false, "message", "Failed to generate OTP. Please try again.")));
                });
    }

    /**
     * Step 2 of OTP login: verify the OTP and issue a JWT on success.
     *
     * <p>Sample request:
     * <pre>POST /api/auth/verify-otp
     * { "phone": "9284939947", "otp": "482931" }</pre>
     * Sample success response (200) – registered user:
     * <pre>{
     *   "success": true,
     *   "isRegistered": true,
     *   "token": "&lt;jwt&gt;",
     *   "user": { ... }
     * }</pre>
     * Sample success response (200) – new user (not yet registered):
     * <pre>{ "success": true, "isRegistered": false }</pre>
     * Sample failure response (401):
     * <pre>{ "success": false, "message": "Invalid or expired OTP" }</pre>
     */
    @PostMapping("/verify-otp")
    public Mono<ResponseEntity<Object>> verifyOtp(@jakarta.validation.Valid @RequestBody OtpVerifyRequest request) {
        String phone = request.getPhone();
        String otp = request.getOtp();

        if (phone == null || phone.isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                    .body((Object) Map.of("success", false, "message", "Phone number is required")));
        }
        if (otp == null || otp.isBlank()) {
            return Mono.just(ResponseEntity.badRequest()
                    .body((Object) Map.of("success", false, "message", "OTP is required")));
        }

        log.info("[AUTH] OTP verification attempt for phone={}", maskPhone(phone));

        return otpService.verifyOtp(phone, otp)
                .flatMap(isValid -> {
                    if (!isValid) {
                        log.warn("[AUTH] OTP verification failed for phone={}", maskPhone(phone));
                        return Mono.just(ResponseEntity.status(401)
                                .body((Object) Map.of("success", false, "message", "Invalid or expired OTP")));
                    }

                    log.info("[AUTH] OTP verified successfully for phone={}", maskPhone(phone));

                    return userService.findByPhone(phone)
                            .map(user -> {
                                if (user.getStatus() == User.UserStatus.PENDING_APPROVAL || Boolean.FALSE.equals(user.getIsApproved())) {
                                    return ResponseEntity.status(403)
                                            .body((Object) Map.of("success", false,
                                                    "message", "Your registration request is pending administrator approval."));
                                }
                                if (user.getStatus() == User.UserStatus.SUSPENDED) {
                                    return ResponseEntity.status(403)
                                            .body((Object) Map.of("success", false,
                                                    "message", "Your account has been suspended."));
                                }
                                if (user.getStatus() == User.UserStatus.REJECTED) {
                                    return ResponseEntity.status(403)
                                            .body((Object) Map.of("success", false,
                                                    "message", "Your registration request was rejected."));
                                }
                                Map<String, Object> response = new HashMap<>();
                                response.put("success", true);
                                response.put("isRegistered", true);
                                response.put("user", user);
                                response.put("token", jwtUtil.generateToken(user));
                                log.info("[AUTH] Login successful for phone={}", maskPhone(phone));
                                return ResponseEntity.ok((Object) response);
                            })
                            .defaultIfEmpty(ResponseEntity.ok(
                                    (Object) Map.of("success", true, "isRegistered", false)));
                })
                .onErrorResume(err -> {
                    log.error("[AUTH] Unexpected error during OTP verification for phone={}: {}", maskPhone(phone), err.getMessage(), err);
                    return Mono.just(ResponseEntity.internalServerError()
                            .body((Object) Map.of("success", false, "message", "Verification failed. Please try again.")));
                });
    }

    @GetMapping("/check-phone/{phone}")
    public Mono<ResponseEntity<Object>> checkPhone(@PathVariable String phone) {
        return userService.findByPhone(phone)
                .map(user -> ResponseEntity.ok((Object) Map.of("isRegistered", true)))
                .defaultIfEmpty(ResponseEntity.ok((Object) Map.of("isRegistered", false)));
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<Object>> login(@RequestBody Map<String, String> request) {
        String phone = request.get("phone");
        String password = request.get("password");

        if (phone == null || password == null) {
            return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "Phone and password are required")));
        }

        return userService.findByPhone(phone)
                .map(user -> {
                    if (user.getStatus() == User.UserStatus.PENDING_APPROVAL || Boolean.FALSE.equals(user.getIsApproved())) {
                        return ResponseEntity.status(403).body((Object) Map.of("success", false, "message", "Your registration request is pending administrator approval."));
                    }
                    if (user.getStatus() == User.UserStatus.SUSPENDED) {
                        return ResponseEntity.status(403).body((Object) Map.of("success", false, "message", "Your account has been suspended."));
                    }
                    if (user.getStatus() == User.UserStatus.REJECTED) {
                        return ResponseEntity.status(403).body((Object) Map.of("success", false, "message", "Your registration request was rejected."));
                    }
                    if (passwordEncoder.matches(password, user.getPassword())) {
                        return ResponseEntity.ok((Object) Map.of(
                            "success", true,
                            "user", user,
                            "token", jwtUtil.generateToken(user)
                        ));
                    } else {
                        return ResponseEntity.status(401).body((Object) Map.of("success", false, "message", "Invalid phone or password"));
                    }
                })
                .defaultIfEmpty(ResponseEntity.status(401).body((Object) Map.of("success", false, "message", "Invalid phone or password")));
    }

    @PostMapping("/register")
    public Mono<ResponseEntity<Object>> register(@RequestBody Map<String, Object> registrationRequest) {
        try {
            String phone = (String) registrationRequest.get("phone");
            String password = (String) registrationRequest.get("password");
            String name = (String) registrationRequest.get("name");
            String pincode = (String) registrationRequest.get("pincode");
            String state = (String) registrationRequest.get("state");
            String district = (String) registrationRequest.get("district");
            String village = (String) registrationRequest.get("village");
            String landMark = (String) registrationRequest.get("landMark");
            
            if (phone == null || phone.isEmpty() || password == null || password.isEmpty() ||
                name == null || name.isEmpty() || 
                pincode == null || pincode.isEmpty() || state == null || state.isEmpty() || 
                district == null || district.isEmpty() || village == null || village.isEmpty() ||
                landMark == null || landMark.isEmpty()) {
                return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "All fields including Password and Landmark are mandatory")));
            }
            
            return userService.findByPhone(phone)
                    .flatMap(existingUser -> Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "Phone number already registered"))))
                    .switchIfEmpty(Mono.defer(() -> {
                        User.Role finalRole = User.Role.CUSTOMER;
                        boolean approved = true;
                        User.UserStatus finalStatus = User.UserStatus.ACTIVE;
                        if (registrationRequest.containsKey("role")) {
                            try {
                                finalRole = User.Role.valueOf(((String) registrationRequest.get("role")).toUpperCase());
                                if (finalRole == User.Role.DEALER) {
                                    approved = false;
                                    finalStatus = User.UserStatus.PENDING_APPROVAL;
                                }
                            } catch (Exception e) {}
                        }

                        User user = User.builder()
                            .phone(phone)
                            .password(passwordEncoder.encode(password))
                            .name(name)
                            .addresses(new ArrayList<>())
                            .role(finalRole)
                            .isApproved(approved)
                            .status(finalStatus)
                            .build();
                        
                        User.Address firstAddress = User.Address.builder()
                            .pincode(pincode)
                            .state(state)
                            .district(district)
                            .village(village)
                            .landMark(landMark)
                            .label("Home")
                            .isDefault(true)
                            .build();
                        
                        user.getAddresses().add(firstAddress);
                        
                        return userService.registerUser(user)
                            .map(registeredUser -> {
                                Map<String, Object> response = new HashMap<>();
                                response.put("success", true);
                                response.put("user", registeredUser);
                                if (Boolean.FALSE.equals(registeredUser.getIsApproved())) {
                                    response.put("isPendingApproval", true);
                                } else {
                                    response.put("token", jwtUtil.generateToken(registeredUser));
                                }
                                return ResponseEntity.ok((Object) response);
                            });
                    }));
        } catch (Exception e) {
            return Mono.just(ResponseEntity.internalServerError().body((Object) Map.of("message", "Registration failed: " + e.getMessage())));
        }
    }

    @PutMapping("/profile")
    public Mono<ResponseEntity<Object>> updateProfile(@RequestBody User user) {
        return userService.updateUser(user)
                .map(updatedUser -> ResponseEntity.ok((Object) Map.of(
                    "success", true,
                    "user", updatedUser
                )))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().body((Object) Map.of("message", "Update failed: " + e.getMessage()))));
    }

    // ------------------------------------------------------------------
    // Private helpers
    // ------------------------------------------------------------------

    /**
     * Masks a phone number so only the last 2 digits are visible in logs.
     * e.g. "9284939947" → "********47"
     */
    private String maskPhone(String phone) {
        if (phone == null || phone.length() <= 2) return "****";
        return "*".repeat(phone.length() - 2) + phone.substring(phone.length() - 2);
    }
}
