package com.swasthanand.api.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    @jakarta.validation.constraints.NotBlank(message = "Phone number is required")
    private String phone;
    
    @jakarta.validation.constraints.NotBlank(message = "OTP is required")
    private String otp;
}
