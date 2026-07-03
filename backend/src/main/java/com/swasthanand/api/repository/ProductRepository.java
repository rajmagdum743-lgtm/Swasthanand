package com.swasthanand.api.repository;

import com.swasthanand.api.model.Product;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface ProductRepository extends R2dbcRepository<Product, String> {
    Flux<Product> findByNameContainingIgnoreCase(String name);
    Mono<Product> findByBatchId(String batchId);
    Flux<Product> findByDealershipNodeId(String dealershipNodeId);
    Flux<Product> findByIsApprovedTrue();
}
