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
public class ProductResponse {
    private String id;
    private String name;
    private String sku;
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

    public static ProductResponse from(Product product) {
        ProductResponse response = new ProductResponse();
        response.setId(product.getId());
        response.setName(product.getName());
        response.setSku(product.getSku());
        response.setPrice(product.getPrice());
        response.setDescription(product.getDescription());
        response.setBenefitsDescription(product.getBenefitsDescription());
        response.setCategory(product.getCategory());
        response.setTags(product.getTags());
        response.setBatchId(product.getBatchId());
        response.setOrigin(product.getOrigin());
        response.setImage(product.getImage());
        response.setStock(product.getStock());
        response.setIsApproved(product.getIsApproved());
        response.setHarvestDate(product.getHarvestDate());
        response.setWeatherTemp(product.getWeatherTemp());
        response.setGrowthQuality(product.getGrowthQuality());
        response.setOrganicMatter(product.getOrganicMatter());
        response.setNitrogen(product.getNitrogen());
        response.setZeroPesticides(product.getZeroPesticides());
        response.setCertificateUrl(product.getCertificateUrl());
        response.setStatus(product.getStatus());
        response.setDealershipNodeId(product.getDealershipNodeId());
        response.setDealerId(product.getDealerId());
        response.setExpiryDate(product.getExpiryDate());
        return response;
    }
}
