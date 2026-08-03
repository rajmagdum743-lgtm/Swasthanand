package com.swasthanand.api.repository;

import com.swasthanand.api.model.Batch;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

public interface BatchRepository extends R2dbcRepository<Batch, String> {
    Flux<Batch> findBySku(String sku);
    Flux<Batch> findByDealerAllocation(String dealerAllocation);
    
    @org.springframework.data.r2dbc.repository.Query("SELECT * FROM batches WHERE expiry_date < :today AND current_state != 'EXPIRED'")
    Flux<Batch> findExpiredBatches(java.time.LocalDate today);
}
