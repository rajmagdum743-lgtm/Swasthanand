package com.swasthanand.api.repository;

import com.swasthanand.api.model.ProductNotification;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface ProductNotificationRepository extends R2dbcRepository<ProductNotification, String> {
    Flux<ProductNotification> findByProductIdAndNotifiedFalse(String productId);
}
