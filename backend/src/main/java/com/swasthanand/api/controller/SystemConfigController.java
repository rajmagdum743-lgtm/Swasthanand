package com.swasthanand.api.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api/system")
public class SystemConfigController {

    @Value("${app.payment.razorpay.enabled:false}")
    private boolean razorpayEnabled;

    @Value("${spring.profiles.active:dev}")
    private String activeProfile;

    @GetMapping("/config")
    public Mono<Map<String, Object>> getConfig() {
        return Mono.just(Map.of(
            "razorpayEnabled", razorpayEnabled,
            "activeProfile", activeProfile
        ));
    }
}
