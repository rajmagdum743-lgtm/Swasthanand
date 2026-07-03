package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDateTime;

@Table("product_notifications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductNotification {
    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();
    
    private String productId;
    private String contactInfo; // Email or Phone number
    
    @Builder.Default
    private Boolean notified = false;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
