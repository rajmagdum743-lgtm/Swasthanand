package com.swasthanand.api.dto;

import lombok.Data;

@Data
public class OtpRequest {
    @jakarta.validation.constraints.NotBlank(message = "Phone number is required")
    @jakarta.validation.constraints.Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be a 10-digit number")
    private String phone;
}
