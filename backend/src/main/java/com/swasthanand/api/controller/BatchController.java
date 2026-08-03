package com.swasthanand.api.controller;

import com.swasthanand.api.model.Batch;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.service.BatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/batches")
@RequiredArgsConstructor
@Tag(name = "Product Batch Management", description = "Endpoints for managing product batches (FR 1 / Step 6)")
public class BatchController {

    private final BatchService batchService;

    @GetMapping("/{id}")
    @Operation(summary = "Get batch by ID")
    public Mono<ResponseEntity<Batch>> getBatchById(@PathVariable String id) {
        return batchService.getBatchById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/sku/{sku}")
    @Operation(summary = "Get batches by SKU")
    public Flux<Batch> getBatchesBySku(@PathVariable String sku) {
        return batchService.getBatchesBySku(sku);
    }

    @GetMapping("/dealer/{dealerId}")
    @Operation(summary = "Get batches allocated to a dealer/node")
    public Flux<Batch> getBatchesByDealer(@PathVariable String dealerId) {
        return batchService.getBatchesByDealerAllocation(dealerId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER')")
    @Operation(summary = "Create a new batch")
    public Mono<Batch> createBatch(@RequestBody Batch batch) {
        return batchService.saveBatch(batch);
    }

    @PutMapping("/{id}/state")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER')")
    @Operation(summary = "Update batch state")
    public Mono<ResponseEntity<Batch>> updateBatchState(@PathVariable String id, @RequestParam Product.LifecycleState state) {
        return batchService.updateBatchState(id, state)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete batch (Admin only)")
    public Mono<ResponseEntity<Void>> deleteBatch(@PathVariable String id) {
        return batchService.deleteBatch(id)
                .thenReturn(ResponseEntity.noContent().build());
    }
}
