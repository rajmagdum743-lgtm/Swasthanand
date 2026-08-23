package com.swasthanand.api.repository;

import com.swasthanand.api.model.InventoryHistory;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface InventoryHistoryRepository extends R2dbcRepository<InventoryHistory, String> {
    Flux<InventoryHistory> findByProductId(String productId);
    Flux<InventoryHistory> findByProductIdOrderByTimestampDesc(String productId);
    Flux<InventoryHistory> findByDealershipNodeId(String dealershipNodeId);
}
