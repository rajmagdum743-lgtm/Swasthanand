package com.swasthanand.api.config;

import lombok.Data;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
@Data
public class SmsConfig {

    @Value("${twilio.account.sid:AC_MESSAGING_SIMULATOR}")
    private String accountSid;

    @Value("${twilio.auth.token:AUTH_TOKEN_SIMULATOR}")
    private String authToken;

    @Value("${twilio.phone.number:+15555555555}")
    private String fromNumber;

    public boolean isSimulator() {
        return "AC_MESSAGING_SIMULATOR".equals(accountSid);
    }
}
