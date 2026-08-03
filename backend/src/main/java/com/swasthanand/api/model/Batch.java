package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDate;
import org.springframework.data.domain.Persistable;

@Table("batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Batch implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();

    private String sku;
    private LocalDate manufacturingDate;
    private LocalDate expiryDate;
    private QCStatus qcStatus;
    private Product.LifecycleState currentState;
    private String dealerAllocation; // node id or dealer id
    private String warehouse;
    
    @Builder.Default
    private Integer inventory = 0;

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

    public enum QCStatus {
        PENDING, PASSED, FAILED
    }
}
