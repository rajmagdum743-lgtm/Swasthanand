package com.swasthanand.api.dto;

import lombok.Data;

@Data
public class OtpVerifyRequest {
    private String phone;
    private String otp;
}
