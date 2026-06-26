package com.swasthanand.api.service;

import com.swasthanand.api.model.FarmBatch;
import com.swasthanand.api.repository.FarmBatchRepository;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class TraceabilityService {

    private final FarmBatchRepository farmBatchRepository;
    private final ProductRepository productRepository;

    public Mono<FarmBatch> getBatchDetails(String batchId) {
        return farmBatchRepository.findById(batchId);
    }

    public Mono<FarmBatch> getBatchByProductId(String productId) {
        return productRepository.findById(productId)
                .flatMap(p -> p.getBatchId() != null ? farmBatchRepository.findById(p.getBatchId()) : Mono.empty());
    }

    public Mono<FarmBatch> saveBatch(FarmBatch batch) {
        return farmBatchRepository.save(batch);
    }
}
