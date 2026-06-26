package com.swasthanand.api.repository;

import com.swasthanand.api.model.DealershipNode;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Mono;

public interface DealershipNodeRepository extends R2dbcRepository<DealershipNode, String> {
    Mono<DealershipNode> findByAssignedDealerId(String assignedDealerId);
}
