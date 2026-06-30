package com.swasthanand.api.controller;

import com.swasthanand.api.model.User;
import com.swasthanand.api.service.UserService;
import com.swasthanand.api.service.OtpService;
import com.swasthanand.api.service.SmsService;
import com.swasthanand.api.dto.OtpRequest;
import com.swasthanand.api.dto.OtpVerifyRequest;
import com.swasthanand.api.security.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.ArrayList;
import java.util.Map;

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

    @PostMapping("/request-otp")
    public Mono<ResponseEntity<Object>> requestOtp(@RequestBody OtpRequest request) {
        return otpService.generateOtp(request.getPhone())
                .doOnNext(code -> smsService.sendOtp(request.getPhone(), code))
                .map(code -> ResponseEntity.ok((Object) Map.of("success", true, "message", "OTP sent successfully")));
    }

    @PostMapping("/verify-otp")
    public Mono<ResponseEntity<Object>> verifyOtp(@RequestBody OtpVerifyRequest request) {
        return otpService.verifyOtp(request.getPhone(), request.getOtp())
                .flatMap(isValid -> {
                    if (!isValid) {
                        return Mono.just(ResponseEntity.status(401).body((Object) Map.of("success", false, "message", "Invalid or expired OTP")));
                    }

                    return userService.findByPhone(request.getPhone())
                            .map(user -> {
                                if (Boolean.FALSE.equals(user.getIsApproved())) {
                                    return ResponseEntity.status(403).body((Object) Map.of("success", false, "message", "Your registration request is pending administrator approval."));
                                }
                                Map<String, Object> response = new HashMap<>();
                                response.put("success", true);
                                response.put("isRegistered", true);
                                response.put("user", user);
                                response.put("token", jwtUtil.generateToken(user));
                                return ResponseEntity.ok((Object) response);
                            })
                            .defaultIfEmpty(ResponseEntity.ok((Object) Map.of("success", true, "isRegistered", false)));
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
                    if (Boolean.FALSE.equals(user.getIsApproved())) {
                        return ResponseEntity.status(403).body((Object) Map.of("success", false, "message", "Your registration request is pending administrator approval."));
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
                        if (registrationRequest.containsKey("role")) {
                            try {
                                finalRole = User.Role.valueOf(((String) registrationRequest.get("role")).toUpperCase());
                                if (finalRole == User.Role.DEALER) {
                                    approved = false;
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
}
