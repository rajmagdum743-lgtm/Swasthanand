package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.time.LocalDate;

import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;

@Table("farm_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FarmBatch implements Persistable<String> {

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
    private LocalDate harvestDate;
    private String locationCoordinates;
    private String region;
    private String soilTestUrl;
    private String weatherSnapshot;
}
