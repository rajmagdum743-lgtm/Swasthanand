package com.swasthanand.api.repository;

import com.swasthanand.api.model.Product;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ProductRepository extends R2dbcRepository<Product, String> {
    Flux<Product> findByNameContainingIgnoreCase(String name);
    Mono<Product> findByBatchId(String batchId);
    Flux<Product> findByDealershipNodeId(String dealershipNodeId);
    Flux<Product> findByDealerId(String dealerId);
    
    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM products WHERE dealer_id = :dealerId OR (dealership_node_id IS NOT NULL AND dealership_node_id = :dealershipNodeId)")
    Flux<Product> findByDealerIdOrDealershipNodeId(String dealerId, String dealershipNodeId);
    
    Flux<Product> findByIsApprovedTrue();

    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM products WHERE id = :id FOR UPDATE")
    Mono<Product> findByIdForUpdate(String id);

    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM products WHERE expiry_date < :today AND status != 'EXPIRED'")
    Flux<Product> findExpiredProducts(java.time.LocalDate today);

    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM products WHERE stock < :threshold")
    Flux<Product> findLowStockProducts(int threshold);
}
