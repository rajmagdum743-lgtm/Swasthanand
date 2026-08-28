package com.swasthanand.api.service;

import com.swasthanand.api.config.SmsConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.test.StepVerifier;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class SmsServiceTest {

    @Mock
    private SmsConfig smsConfig;

    private SmsService smsService;

    @BeforeEach
    public void setUp() {
        lenient().when(smsConfig.isSimulator()).thenReturn(true);
        lenient().when(smsConfig.getAccountSid()).thenReturn("AC_TEST");
        lenient().when(smsConfig.getAuthToken()).thenReturn("AUTH_TEST");
        lenient().when(smsConfig.getFromNumber()).thenReturn("+15555555555");
        
        smsService = new SmsService(smsConfig);
    }

    @Test
    public void testInit_Simulator() {
        lenient().when(smsConfig.isSimulator()).thenReturn(true);
        smsService.init();
    }

    @Test
    public void testInit_Production() {
        lenient().when(smsConfig.isSimulator()).thenReturn(false);
        try {
            smsService.init();
        } catch (Exception e) {
            // Ignore Twilio initialisation issues in unit tests
        }
    }

    @Test
    public void testSendOtp_SimulatorMode() {
        smsService.init();
        smsService.sendOtp("9876543210", "123456");
    }

    @Test
    public void testSendOtp_NullPhoneOrOtp() {
        smsService.init();
        smsService.sendOtp(null, "123456");
        smsService.sendOtp("", "123456");
        smsService.sendOtp("9876543210", null);
        smsService.sendOtp("9876543210", "");
    }

    @Test
    public void testSendOtpReactive_SimulatorMode() {
        smsService.init();
        StepVerifier.create(smsService.sendOtpReactive("9876543210", "123456"))
                .verifyComplete();
    }

    @Test
    public void testSendOtp_ProductionFallback() {
        lenient().when(smsConfig.isSimulator()).thenReturn(false);
        smsService.sendOtp("+919876543210", "123456");
    }
}
