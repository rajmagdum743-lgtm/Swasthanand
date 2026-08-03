package com.swasthanand.api.dto;

import com.swasthanand.api.model.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductRequest {
    private String id;
    
    @jakarta.validation.constraints.NotBlank(message = "Product name is required")
    private String name;
    
    @jakarta.validation.constraints.NotBlank(message = "SKU is required")
    private String sku;
    
    @jakarta.validation.constraints.NotNull(message = "Price is required")
    @jakarta.validation.constraints.Positive(message = "Price must be positive")
    private BigDecimal price;
    
    private String description;
    private String benefitsDescription;
    private String category;
    private List<String> tags;
    private String batchId;
    private String origin;
    private String image;
    private Integer stock;
    private Boolean isApproved;
    private String harvestDate;
    private String weatherTemp;
    private String growthQuality;
    private String organicMatter;
    private String nitrogen;
    private String zeroPesticides;
    private String certificateUrl;
    private Product.LifecycleState status;
    private String dealershipNodeId;
    private String dealerId;
    private LocalDate expiryDate;
}
