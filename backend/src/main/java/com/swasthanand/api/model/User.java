package com.swasthanand.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.relational.core.mapping.Table;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Persistable;
import org.springframework.data.annotation.Transient;
import com.fasterxml.jackson.annotation.JsonProperty;

@Table("users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements Persistable<String> {

    @Id
    @Builder.Default
    private String id = java.util.UUID.randomUUID().toString();
    private String phone;
    private String password;
    private String name;
    private Role role;
    
    @JsonProperty("isApproved")
    private Boolean isApproved;
    
    private UserStatus status;
    
    private String addressesJson; // DB column containing serialized addresses list

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

    @Transient
    @Builder.Default
    private List<Address> addresses = new ArrayList<>();

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Address {
        private String label; // "Work", "Home", etc.
        private String pincode;
        private String state;
        private String district;
        private String village;
        private String landMark;
        private boolean isDefault;
    }

    public enum Role {
        CUSTOMER, ADMIN, FARMER, DEALER
    }

    public enum UserStatus {
        PENDING_APPROVAL, ACTIVE, SUSPENDED, REJECTED, APPROVED
    }

    @Transient
    private static final com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();

    public void serializeAddresses() {
        try {
            this.addressesJson = mapper.writeValueAsString(this.addresses);
        } catch (Exception e) {
            this.addressesJson = "[]";
        }
    }

    public void deserializeAddresses() {
        try {
            if (this.addressesJson != null && !this.addressesJson.isBlank()) {
                this.addresses = mapper.readValue(this.addressesJson, new com.fasterxml.jackson.core.type.TypeReference<List<Address>>() {});
            } else {
                this.addresses = new ArrayList<>();
            }
        } catch (Exception e) {
            this.addresses = new ArrayList<>();
        }
    }
}
