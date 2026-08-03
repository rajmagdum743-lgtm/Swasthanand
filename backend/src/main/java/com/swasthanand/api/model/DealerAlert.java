package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.domain.Persistable;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDateTime;

@Table("dealer_alerts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealerAlert implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();
    
    private String dealerId;
    private String subject;
    private String message;
    
    @Builder.Default
    private String messageType = "INFORMATION"; // INFORMATION, WARNING, SUCCESS, IMPORTANT
    
    @Builder.Default
    private Boolean isRead = false;
    
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

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
}
