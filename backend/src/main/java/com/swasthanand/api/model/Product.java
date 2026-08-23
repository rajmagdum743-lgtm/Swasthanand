package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;

@Table("products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();
    private String name;
    private String sku;

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
    private BigDecimal price;
    private String description;
    private String benefitsDescription;
    private String category;
    
    private String tagsJson; // DB column containing serialized tags list

    @Transient
    @Builder.Default
    private List<String> tags = new java.util.ArrayList<>();

    private String batchId;
    private String origin;
    private String image;
    
    @Builder.Default
    private Integer stock = 100;
    
    @Builder.Default
    private Boolean isApproved = true;
    
    // Traceability & Origin specific fields
    private String harvestDate;
    private String mfgDate;
    private String processingDetails;
    private String storageDetails;
    private String transportDetails;
    private String qualityInfo;
    private String weatherTemp;
    private String growthQuality;
    private String organicMatter;
    private String nitrogen;
    private String zeroPesticides;
    private String certificateUrl;

    // Phase 1 SRS lifecycle and inventory fields
    private LifecycleState status;
    private String dealershipNodeId;
    private String dealerId;
    private LocalDate expiryDate;

    public enum LifecycleState {
        MANUFACTURED, QC_PENDING, QC_PASSED, WAREHOUSE, DEALER_ALLOCATED, IN_TRANSIT, DELIVERED, SOLD, RETURNED, EXPIRED, DESTROYED
    }


    @Transient
    private static final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public void serializeTags() {
        try {
            this.tagsJson = mapper.writeValueAsString(this.tags);
        } catch (Exception e) {
            this.tagsJson = "[]";
        }
    }

    public void deserializeTags() {
        try {
            if (this.tagsJson != null && !this.tagsJson.isBlank()) {
                this.tags = mapper.readValue(this.tagsJson, new com.fasterxml.jackson.core.type.TypeReference<List<String>>() {});
            } else {
                this.tags = new java.util.ArrayList<>();
            }
        } catch (Exception e) {
            this.tags = new java.util.ArrayList<>();
        }
    }
}
