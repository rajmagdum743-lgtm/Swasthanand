package com.swasthanand.api.service;

import com.swasthanand.api.model.Batch;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class BatchService {

    private final BatchRepository batchRepository;

    public Mono<Batch> getBatchById(String id) {
        return batchRepository.findById(id);
    }

    public Flux<Batch> getBatchesBySku(String sku) {
        return batchRepository.findBySku(sku);
    }

    public Flux<Batch> getBatchesByDealerAllocation(String dealerAllocation) {
        return batchRepository.findByDealerAllocation(dealerAllocation);
    }

    public Mono<Batch> saveBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    public Mono<Void> deleteBatch(String id) {
        return batchRepository.deleteById(id);
    }

    public Mono<Batch> updateBatchState(String batchId, Product.LifecycleState nextState) {
        return batchRepository.findById(batchId)
                .flatMap(batch -> {
                    log.info("[BATCH-STATE] Updating batch {} state from {} to {}", batchId, batch.getCurrentState(), nextState);
                    batch.setCurrentState(nextState);
                    return batchRepository.save(batch);
                })
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Batch not found: " + batchId)));
    }
}
