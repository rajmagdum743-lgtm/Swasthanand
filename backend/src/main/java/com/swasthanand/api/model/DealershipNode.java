package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;

import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;

@Table("dealership_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DealershipNode implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();
    private String name;
    private double latitude;
    private double longitude;
    private double geofenceRadiusKm;
    private String assignedDealerId;

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
