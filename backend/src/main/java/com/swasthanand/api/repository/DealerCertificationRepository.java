package com.swasthanand.api.repository;

import com.swasthanand.api.model.DealerCertification;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface DealerCertificationRepository extends R2dbcRepository<DealerCertification, String> {
    Flux<DealerCertification> findByDealerIdOrderByCreatedAtDesc(String dealerId);
}
