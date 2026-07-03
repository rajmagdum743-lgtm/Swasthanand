package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;

@Table("orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();

    @Transient
    @Builder.Default
    private boolean isNew = true;

    @Override
    public boolean isNew() {
        return this.isNew;
    }

    public void setNew(boolean isNew) {
        this.isNew = isNew;
    }

    @Override
    public String getId() {
        return this.id;
    }
    private String userId; // Replaces relational User object mapping for reactive WebFlux compatibility
    private BigDecimal totalAmount;
    private OrderStatus status;
    private String razorpayOrderId;
    private String dealershipNodeId; // Dealership node responsible for processing the order
    private String itemsJson;
    
    @Transient
    @Builder.Default
    private java.util.List<OrderItem> items = new java.util.ArrayList<>();

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrderItem {
        private String productId;
        private Integer quantity;
        private BigDecimal price;
    }
    
    @Transient
    private static final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public void serializeItems() {
        try {
            this.itemsJson = mapper.writeValueAsString(this.items);
        } catch (Exception e) {
            this.itemsJson = "[]";
        }
    }

    public void deserializeItems() {
        try {
            if (this.itemsJson != null && !this.itemsJson.isBlank()) {
                this.items = mapper.readValue(this.itemsJson, new com.fasterxml.jackson.core.type.TypeReference<java.util.List<OrderItem>>() {});
            } else {
                this.items = new java.util.ArrayList<>();
            }
        } catch (Exception e) {
            this.items = new java.util.ArrayList<>();
        }
    }

    public enum OrderStatus {
        PENDING, PAID, CONFIRMED, TRANSIT, SHIPPED, DELIVERED, CANCELLED
    }

    private String cancellationReason;
}
