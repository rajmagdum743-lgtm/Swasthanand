package com.swasthanand.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import reactor.test.StepVerifier;

public class OtpServiceTest {

    private OtpService otpService;

    @BeforeEach
    public void setUp() {
        otpService = new OtpService();
    }

    @Test
    public void testGenerateAndVerifyOtp_Success() {
        String phone = "9876543210";
        
        StepVerifier.create(otpService.generateOtp(phone)
                .flatMap(code -> otpService.verifyOtp(phone, code)))
                .expectNext(true)
                .verifyComplete();
    }

    @Test
    public void testVerifyOtp_InvalidCode() {
        String phone = "9876543210";
        
        StepVerifier.create(otpService.generateOtp(phone)
                .flatMap(code -> otpService.verifyOtp(phone, "000000")))
                .expectNext(false)
                .verifyComplete();
    }

    @Test
    public void testVerifyOtp_NoOtpGenerated() {
        StepVerifier.create(otpService.verifyOtp("9876543210", "123456"))
                .expectNext(false)
                .verifyComplete();
    }
}
