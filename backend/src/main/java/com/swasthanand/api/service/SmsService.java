package com.swasthanand.api.service;

import com.swasthanand.api.config.SmsConfig;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SmsService {

    private final SmsConfig smsConfig;

    @PostConstruct
    public void init() {
        if (!smsConfig.isSimulator()) {
            Twilio.init(smsConfig.getAccountSid(), smsConfig.getAuthToken());
        }
    }

    public void sendOtp(String phone, String otp) {
        String formattedPhone = formatPhone(phone);
        String messageBody = "Your Swasthanand Verification Code is: " + otp + ". Valid for 5 minutes.";

        if (smsConfig.isSimulator()) {
            logToTerminal(formattedPhone, otp);
            return;
        }

        try {
            Message.creator(
                    new PhoneNumber(formattedPhone),
                    new PhoneNumber(smsConfig.getFromNumber()),
                    messageBody).create();
            System.out.println(">>> Real SMS sent to " + formattedPhone);
        } catch (Exception e) {
            System.err.println("!!! Failed to send Real SMS: " + e.getMessage());
            logToTerminal(formattedPhone, otp); // Fallback to terminal if API fails
        }
    }

    private String formatPhone(String phone) {
        String clean = phone.replaceAll("[^0-9+]", "");
        if (clean.startsWith("+"))
            return clean;
        // Default to +91 for India if no country code provided
        return "+91" + clean;
    }

    private void logToTerminal(String phone, String otp) {
        System.out.println("\n" + "=".repeat(60));
        System.out.println(" [SMS GATEWAY SIMULATOR - NO CREDENTIALS FOUND]");
        System.out.println(" TO: " + phone);
        System.out.println(" MESSAGE: Your Swasthanand Verification Code is: " + otp);
        System.out.println(" VALID FOR: 5 Minutes");
        System.out.println("=".repeat(60) + "\n");
    }
}
