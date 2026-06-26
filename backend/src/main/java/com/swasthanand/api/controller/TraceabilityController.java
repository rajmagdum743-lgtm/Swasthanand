package com.swasthanand.api.controller;

import com.swasthanand.api.dto.TraceabilityDTO;
import com.swasthanand.api.model.FarmBatch;
import com.swasthanand.api.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/traceability")
@RequiredArgsConstructor
public class TraceabilityController {

    private final TraceabilityService traceabilityService;

    @GetMapping("/{batchId}")
    public Mono<ResponseEntity<TraceabilityDTO>> getBatchDetails(@PathVariable String batchId) {
        return traceabilityService.getBatchDetails(batchId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/product/{productId}")
    public Mono<ResponseEntity<TraceabilityDTO>> getBatchByProduct(@PathVariable String productId) {
        return traceabilityService.getBatchByProductId(productId)
                .map(this::convertToDTO)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    private TraceabilityDTO convertToDTO(FarmBatch batch) {
        return TraceabilityDTO.builder()
                .id(batch.getId())
                .harvestDate(batch.getHarvestDate())
                .region(batch.getRegion())
                .soilTestUrl(batch.getSoilTestUrl())
                .weatherSnapshot(batch.getWeatherSnapshot())
                .build();
    }

    @PostMapping
    public Mono<FarmBatch> createBatch(@RequestBody FarmBatch batch) {
        return traceabilityService.saveBatch(batch);
    }
}
