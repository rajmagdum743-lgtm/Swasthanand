package com.swasthanand.api.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "razorpay")
@Data
public class RazorpayConfig {
    private Key key = new Key();

    @Data
    public static class Key {
        private String id;
        private String secret;
    }
}
