package com.swasthanand.api.service;

import com.swasthanand.api.dto.ProductRequest;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;
    private final com.swasthanand.api.repository.ProductNotificationRepository notificationRepository;
    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private static final String CACHE_PREFIX = "product::";
    private final com.fasterxml.jackson.databind.ObjectMapper objectMapper = new com.fasterxml.jackson.databind.ObjectMapper()
            .registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());

    public Flux<Product> getAllProducts() {
        return productRepository.findAll()
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Flux<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Mono<Product> getProductById(String id) {
        String key = CACHE_PREFIX + id;
        return redisTemplate.opsForValue().get(key)
                .map(cached -> {
                    Product p;
                    if (cached instanceof Product) {
                        p = (Product) cached;
                    } else {
                        p = objectMapper.convertValue(cached, Product.class);
                    }
                    p.deserializeTags();
                    return p;
                })
                .onErrorResume(err -> Mono.empty())
                .switchIfEmpty(Mono.defer(() ->
                        productRepository.findById(id)
                                .flatMap(product -> {
                                    product.deserializeTags();
                                    return redisTemplate.opsForValue().set(key, product)
                                            .onErrorResume(err -> Mono.empty())
                                            .thenReturn(product);
                                })
                ));
    }

    public Mono<Product> saveProduct(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId(java.util.UUID.randomUUID().toString());
        }
        product.serializeTags();
        return productRepository.findById(product.getId())
                .flatMap(oldProduct -> {
                    int oldStock = oldProduct.getStock() != null ? oldProduct.getStock() : 0;
                    Product.LifecycleState oldStatus = oldProduct.getStatus();
                    
                    return productRepository.save(product)
                            .doOnSuccess(saved -> {
                                int newStock = saved.getStock() != null ? saved.getStock() : 0;
                                eventPublisher.publishEvent(new com.swasthanand.api.event.ProductLifecycleEvent(
                                        this, saved.getId(), oldStock, newStock, oldStatus, saved.getStatus()));
                            });
                })
                .switchIfEmpty(Mono.defer(() -> {
                    return productRepository.save(product)
                            .doOnSuccess(saved -> {
                                int newStock = saved.getStock() != null ? saved.getStock() : 0;
                                eventPublisher.publishEvent(new com.swasthanand.api.event.ProductLifecycleEvent(
                                        this, saved.getId(), 0, newStock, null, saved.getStatus()));
                            });
                }))
                .flatMap(savedProduct -> {
                    savedProduct.deserializeTags();
                    String key = CACHE_PREFIX + savedProduct.getId();
                    return Mono.defer(() -> 
                        redisTemplate.opsForValue().set(key, savedProduct)
                            .then(redisTemplate.opsForValue().delete("products::catalog"))
                    )
                    .onErrorResume(err -> {
                        log.warn("Redis operations bypassed: {}", err.getMessage());
                        return Mono.empty();
                    })
                    .thenReturn(savedProduct);
                });
    }
    
    public Mono<Product> approveProduct(String id) {
        return productRepository.findById(id)
                .flatMap(product -> {
                    product.setIsApproved(true);
                    return saveProduct(product);
                });
    }

    public Mono<Void> deleteProduct(String id) {
        String key = CACHE_PREFIX + id;
        return productRepository.deleteById(id)
                .then(redisTemplate.opsForValue().delete(key))
                .then(redisTemplate.opsForValue().delete("products::catalog"))
                .then();
    }

    @org.springframework.transaction.annotation.Transactional
    public Mono<Product> incrementStock(String productId, int quantity, String performedBy, String reason) {
        if (quantity <= 0) {
            return Mono.error(new IllegalArgumentException("Quantity must be positive"));
        }
        return productRepository.findByIdForUpdate(productId)
                .flatMap(product -> {
                    int oldStock = product.getStock() != null ? product.getStock() : 0;
                    int newStock = oldStock + quantity;
                    product.setStock(newStock);
                    
                    if (product.getStatus() == Product.LifecycleState.SOLD && newStock > 0) {
                        product.setStatus(Product.LifecycleState.QC_PASSED);
                    }
                    
                    return saveProduct(product)
                            .doOnSuccess(saved -> {
                                eventPublisher.publishEvent(new com.swasthanand.api.event.InventoryChangedEvent(
                                        this, productId, saved.getDealershipNodeId(), quantity, newStock, 
                                        "INCREMENT", reason, performedBy));
                            });
                })
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found: " + productId)));
    }

    @org.springframework.transaction.annotation.Transactional
    public Mono<Product> decrementStock(String productId, int quantity, String performedBy, String reason) {
        if (quantity <= 0) {
            return Mono.error(new IllegalArgumentException("Quantity must be positive"));
        }
        return productRepository.findByIdForUpdate(productId)
                .flatMap(product -> {
                    int oldStock = product.getStock() != null ? product.getStock() : 0;
                    if (oldStock < quantity) {
                        return Mono.error(new IllegalArgumentException("Insufficient stock. Available: " + oldStock + ", Requested: " + quantity));
                    }
                    int newStock = oldStock - quantity;
                    product.setStock(newStock);
                    if (newStock == 0) {
                        product.setStatus(Product.LifecycleState.SOLD);
                    }
                    return saveProduct(product)
                            .doOnSuccess(saved -> {
                                eventPublisher.publishEvent(new com.swasthanand.api.event.InventoryChangedEvent(
                                        this, productId, saved.getDealershipNodeId(), -quantity, newStock, 
                                        "DECREMENT", reason, performedBy));
                            });
                })
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found: " + productId)));
    }

    @org.springframework.transaction.annotation.Transactional
    public Mono<Product> reserveStock(String productId, int quantity, String performedBy, String reason) {
        return decrementStock(productId, quantity, performedBy, "[RESERVE] " + reason);
    }

    @org.springframework.transaction.annotation.Transactional
    public Mono<Product> releaseStock(String productId, int quantity, String performedBy, String reason) {
        return incrementStock(productId, quantity, performedBy, "[RELEASE] " + reason);
    }

    public Mono<Product> getProductByBatchId(String batchId) {
        return productRepository.findByBatchId(batchId)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Flux<Product> getProductsByDealershipNode(String dealershipNodeId) {
        return productRepository.findByDealershipNodeId(dealershipNodeId)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public static Product toEntity(ProductRequest request) {
        Product product = new Product();
        product.setId(request.getId() != null && !request.getId().trim().isEmpty() ? request.getId() : java.util.UUID.randomUUID().toString());
        product.setName(request.getName());
        product.setSku(request.getSku());
        product.setPrice(request.getPrice());
        product.setDescription(request.getDescription());
        product.setBenefitsDescription(request.getBenefitsDescription());
        product.setCategory(request.getCategory());
        product.setTags(request.getTags());
        product.setBatchId(request.getBatchId());
        product.setOrigin(request.getOrigin());
        product.setImage(request.getImage());
        product.setStock(request.getStock());
        product.setIsApproved(request.getIsApproved());
        product.setHarvestDate(request.getHarvestDate());
        product.setWeatherTemp(request.getWeatherTemp());
        product.setGrowthQuality(request.getGrowthQuality());
        product.setOrganicMatter(request.getOrganicMatter());
        product.setNitrogen(request.getNitrogen());
        product.setZeroPesticides(request.getZeroPesticides());
        product.setCertificateUrl(request.getCertificateUrl());
        product.setStatus(request.getStatus());
        product.setDealershipNodeId(request.getDealershipNodeId());
        product.setDealerId(request.getDealerId());
        product.setExpiryDate(request.getExpiryDate());
        product.serializeTags();
        return product;
    }
}
