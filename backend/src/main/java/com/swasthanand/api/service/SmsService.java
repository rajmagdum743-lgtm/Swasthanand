package com.swasthanand.api.service;

import com.swasthanand.api.config.SmsConfig;
import com.twilio.Twilio;
import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

/**
 * Service responsible for OTP SMS delivery.
 *
 * <p><b>Simulator mode</b> (default when no real Twilio/Fast2SMS credentials are set):
 * Instead of sending a network request, the OTP is printed to the application
 * log at {@code INFO} level so developers can copy-paste it during testing.
 * Look for lines containing {@code [SMS-SIM]}.</p>
 *
 * <p><b>Production mode</b>: Set Twilio credentials ({@code TWILIO_ACCOUNT_SID}, 
 * {@code TWILIO_AUTH_TOKEN}, {@code TWILIO_PHONE_NUMBER}) or Fast2SMS API key 
 * ({@code FAST2SMS_API_KEY}) to send real SMS.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SmsService {

    private final SmsConfig smsConfig;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    // -----------------------------------------------------------------------
    // Lifecycle
    // -----------------------------------------------------------------------

    @PostConstruct
    public void init() {
        if (smsConfig.isFast2Sms()) {
            log.info("[SMS] Fast2SMS provider configured for real SMS delivery.");
        } else if (smsConfig.isTwilio()) {
            Twilio.init(smsConfig.getAccountSid(), smsConfig.getAuthToken());
            log.info("[SMS] Twilio initialised with from-number={}", smsConfig.getFromNumber());
        } else {
            log.info("[SMS] Running in SIMULATOR mode — OTPs will be logged to console, no real SMS will be sent.");
        }
    }

    // -----------------------------------------------------------------------
    // Public API
    // -----------------------------------------------------------------------

    public void sendOtp(String phone, String otp) {
        if (phone == null || phone.isBlank()) {
            log.error("[SMS] sendOtp called with null/blank phone — skipping delivery");
            return;
        }
        if (otp == null || otp.isBlank()) {
            log.error("[SMS] sendOtp called with null/blank OTP for phone={} — skipping delivery", maskPhone(phone));
            return;
        }

        String formattedPhone = formatPhone(phone);

        if (smsConfig.isFast2Sms()) {
            sendViaFast2Sms(formattedPhone, otp);
        } else if (smsConfig.isTwilio()) {
            sendViaTwilio(formattedPhone, otp);
        } else {
            simulatorLog(formattedPhone, otp);
        }
    }

    public Mono<Void> sendOtpReactive(String phone, String otp) {
        return Mono.fromRunnable(() -> sendOtp(phone, otp))
                   .subscribeOn(Schedulers.boundedElastic())
                   .then();
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    private void sendViaFast2Sms(String formattedPhone, String otp) {
        try {
            String tenDigit = formattedPhone.replaceAll("[^0-9]", "");
            if (tenDigit.startsWith("91") && tenDigit.length() == 12) {
                tenDigit = tenDigit.substring(2);
            }
            String url = "https://www.fast2sms.com/dev/bulkV2?authorization=" 
                    + smsConfig.getFast2smsApiKey() 
                    + "&variables_values=" + otp 
                    + "&route=otp&numbers=" + tenDigit;

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            log.info("[SMS] Fast2SMS response code={} body={}", response.statusCode(), response.body());
        } catch (Exception e) {
            log.error("[SMS] Fast2SMS delivery FAILED to={} error={} — falling back to simulator log",
                    formattedPhone, e.getMessage(), e);
            simulatorLog(formattedPhone, otp);
        }
    }

    private void sendViaTwilio(String formattedPhone, String otp) {
        String body = buildMessageBody(otp);
        try {
            Message msg = Message.creator(
                    new PhoneNumber(formattedPhone),
                    new PhoneNumber(smsConfig.getFromNumber()),
                    body
            ).create();
            log.info("[SMS] SMS sent via Twilio to={} sid={}", formattedPhone, msg.getSid());
        } catch (Exception e) {
            log.error("[SMS] Twilio delivery FAILED to={} error={} — falling back to simulator log",
                    formattedPhone, e.getMessage(), e);
            simulatorLog(formattedPhone, otp);
        }
    }

    private void simulatorLog(String phone, String otp) {
        log.info("╔══════════════════════════════════════════╗");
        log.info("║         [SMS-SIM] OTP DELIVERY           ║");
        log.info("║  TO  : {}                      ║", phone);
        log.info("║  OTP : {}                               ║", otp);
        log.info("║  TTL : 5 minutes                         ║");
        log.info("╚══════════════════════════════════════════╝");
    }

    private String formatPhone(String phone) {
        String clean = phone.replaceAll("[^0-9+]", "");
        if (clean.startsWith("+")) {
            return clean;
        }
        if (clean.startsWith("0")) {
            clean = clean.substring(1);
        }
        return "+91" + clean;
    }

    private String buildMessageBody(String otp) {
        return "Your Swasthanand verification code is: " + otp
                + ". Valid for 5 minutes. Do not share this code with anyone.";
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() <= 2) return "****";
        return "*".repeat(phone.length() - 2) + phone.substring(phone.length() - 2);
    }
}

