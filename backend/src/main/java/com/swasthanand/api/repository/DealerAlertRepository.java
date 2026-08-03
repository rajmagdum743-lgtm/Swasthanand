package com.swasthanand.api.repository;

import com.swasthanand.api.model.DealerAlert;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface DealerAlertRepository extends R2dbcRepository<DealerAlert, String> {
    Flux<DealerAlert> findByDealerIdOrderByCreatedAtDesc(String dealerId);
}
