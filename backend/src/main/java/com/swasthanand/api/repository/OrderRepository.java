package com.swasthanand.api.repository;

import com.swasthanand.api.model.Order;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface OrderRepository extends R2dbcRepository<Order, String> {
    Flux<Order> findByUserId(String userId);
    Flux<Order> findByDealershipNodeId(String dealershipNodeId);
}
