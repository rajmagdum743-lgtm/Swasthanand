package com.swasthanand.api.service;

import com.swasthanand.api.model.FarmBatch;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.FarmBatchRepository;
import com.swasthanand.api.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.time.LocalDate;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class TraceabilityServiceTest {

    @Mock
    private FarmBatchRepository farmBatchRepository;

    @Mock
    private ProductRepository productRepository;

    private TraceabilityService traceabilityService;
    private FarmBatch sampleFarmBatch;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        traceabilityService = new TraceabilityService(farmBatchRepository, productRepository);
        sampleFarmBatch = FarmBatch.builder()
                .id("batch-123")
                .harvestDate(LocalDate.now())
                .region("Sangli")
                .build();
        sampleProduct = Product.builder()
                .id("prod-123")
                .batchId("batch-123")
                .build();
    }

    @Test
    public void testGetBatchDetails() {
        when(farmBatchRepository.findById("batch-123")).thenReturn(Mono.just(sampleFarmBatch));

        StepVerifier.create(traceabilityService.getBatchDetails("batch-123"))
                .expectNextMatches(b -> b.getRegion().equals("Sangli"))
                .verifyComplete();
    }

    @Test
    public void testGetBatchByProductId() {
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(farmBatchRepository.findById("batch-123")).thenReturn(Mono.just(sampleFarmBatch));

        StepVerifier.create(traceabilityService.getBatchByProductId("prod-123"))
                .expectNextMatches(b -> b.getId().equals("batch-123"))
                .verifyComplete();
    }

    @Test
    public void testSaveBatch() {
        when(farmBatchRepository.save(any(FarmBatch.class))).thenReturn(Mono.just(sampleFarmBatch));

        StepVerifier.create(traceabilityService.saveBatch(sampleFarmBatch))
                .expectNextMatches(b -> b.getId().equals("batch-123"))
                .verifyComplete();
    }
}
