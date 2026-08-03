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

    @Value("${fast2sms.api.key:}")
    private String fast2smsApiKey;

    public boolean isFast2Sms() {
        return fast2smsApiKey != null && !fast2smsApiKey.isBlank() && !"YOUR_FAST2SMS_API_KEY".equals(fast2smsApiKey);
    }

    public boolean isTwilio() {
        return accountSid != null && !accountSid.isBlank() 
                && !"AC_MESSAGING_SIMULATOR".equals(accountSid) 
                && !"YOUR_TWILIO_SID".equals(accountSid);
    }

    public boolean isSimulator() {
        return !isFast2Sms() && !isTwilio();
    }
}

