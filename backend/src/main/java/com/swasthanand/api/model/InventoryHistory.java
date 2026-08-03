package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDateTime;
import org.springframework.data.domain.Persistable;

@Table("inventory_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryHistory implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();

    private String productId;
    private String dealershipNodeId;
    private Integer changeQuantity;
    private Integer resultingStock;
    private TransactionType transactionType;
    private String reason;
    private String performedBy;
    
    @Builder.Default
    private LocalDateTime timestamp = LocalDateTime.now();

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

    public enum TransactionType {
        INCREMENT, DECREMENT, RESERVE, RELEASE
    }
}
