package com.swasthanand.api.controller;

import com.swasthanand.api.dto.TraceabilityDTO;
import com.swasthanand.api.dto.TraceabilityDetailsDTO;
import com.swasthanand.api.model.*;
import com.swasthanand.api.repository.*;
import com.swasthanand.api.service.TraceabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/traceability")
@RequiredArgsConstructor
public class TraceabilityController {

    private final TraceabilityService traceabilityService;
    private final ProductRepository productRepository;
    private final FarmBatchRepository farmBatchRepository;
    private final DealershipNodeRepository dealershipNodeRepository;
    private final AuditLogRepository auditLogRepository;

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

    @GetMapping("/search")
    public Flux<Product> search(@RequestParam(required = false) String sku, @RequestParam(required = false) String batchId) {
        if (sku != null && !sku.isBlank()) {
            return productRepository.findByNameContainingIgnoreCase(sku); // Fallback search by sku as well
        } else if (batchId != null && !batchId.isBlank()) {
            return productRepository.findByBatchId(batchId).flux();
        }
        return Flux.empty();
    }

    @GetMapping("/history/{productId}")
    public Mono<ResponseEntity<TraceabilityDetailsDTO>> getHistory(@PathVariable String productId) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    Mono<FarmBatch> farmMono = product.getBatchId() != null 
                            ? farmBatchRepository.findById(product.getBatchId()).defaultIfEmpty(new FarmBatch())
                            : Mono.just(new FarmBatch());

                    Mono<DealershipNode> nodeMono = product.getDealershipNodeId() != null
                            ? dealershipNodeRepository.findById(product.getDealershipNodeId()).defaultIfEmpty(new DealershipNode())
                            : Mono.just(new DealershipNode());

                    Mono<List<AuditLog>> logsMono = auditLogRepository.findByEntityNameAndEntityId("Product", productId)
                            .collectList();

                    return Mono.zip(farmMono, nodeMono, logsMono)
                            .map(tuple -> {
                                FarmBatch fb = tuple.getT1();
                                DealershipNode dn = tuple.getT2();
                                List<AuditLog> allLogs = tuple.getT3();

                                List<AuditLog> qcLogs = new ArrayList<>();
                                List<AuditLog> movementLogs = new ArrayList<>();

                                for (AuditLog log : allLogs) {
                                    if ("QC_PASSED".equalsIgnoreCase(log.getAction())) {
                                        qcLogs.add(log);
                                    }
                                    if ("DEALER_ALLOCATED".equalsIgnoreCase(log.getAction()) || "SEND_TO_WAREHOUSE".equalsIgnoreCase(log.getAction())) {
                                        movementLogs.add(log);
                                    }
                                }

                                return TraceabilityDetailsDTO.builder()
                                        .product(product)
                                        .farmBatch(fb.getId() != null ? fb : null)
                                        .dealershipNode(dn.getId() != null ? dn : null)
                                        .lifecycleTimeline(allLogs)
                                        .qcHistory(qcLogs)
                                        .warehouseMovement(movementLogs)
                                        .build();
                            });
                })
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
