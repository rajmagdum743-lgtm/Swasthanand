package com.swasthanand.api.repository;

import com.swasthanand.api.model.AuditLog;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Flux;

public interface AuditLogRepository extends R2dbcRepository<AuditLog, String> {
    Flux<AuditLog> findByEntityNameAndEntityId(String entityName, String entityId);
}
