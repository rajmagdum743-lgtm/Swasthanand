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

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum OrderStatus {
        PENDING, PAID, CONFIRMED, TRANSIT, SHIPPED, DELIVERED, CANCELLED
    }

    private String cancellationReason;
}
