package com.swasthanand.api.repository;

import com.swasthanand.api.model.FarmBatch;
import org.springframework.data.r2dbc.repository.R2dbcRepository;

public interface FarmBatchRepository extends R2dbcRepository<FarmBatch, String> {
}
