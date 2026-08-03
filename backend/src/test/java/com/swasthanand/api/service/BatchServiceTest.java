package com.swasthanand.api.service;

import com.swasthanand.api.model.Batch;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.BatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.time.LocalDate;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class BatchServiceTest {

    @Mock
    private BatchRepository batchRepository;

    private BatchService batchService;
    private Batch sampleBatch;

    @BeforeEach
    public void setUp() {
        batchService = new BatchService(batchRepository);
        sampleBatch = Batch.builder()
                .id("batch-123")
                .sku("TURM-FING-01")
                .manufacturingDate(LocalDate.now())
                .expiryDate(LocalDate.now().plusMonths(12))
                .qcStatus(Batch.QCStatus.PENDING)
                .currentState(Product.LifecycleState.MANUFACTURED)
                .inventory(100)
                .build();
    }

    @Test
    public void testGetBatchById() {
        when(batchRepository.findById("batch-123")).thenReturn(Mono.just(sampleBatch));

        StepVerifier.create(batchService.getBatchById("batch-123"))
                .expectNextMatches(b -> b.getSku().equals("TURM-FING-01"))
                .verifyComplete();
    }

    @Test
    public void testGetBatchesBySku() {
        when(batchRepository.findBySku("TURM-FING-01")).thenReturn(Flux.just(sampleBatch));

        StepVerifier.create(batchService.getBatchesBySku("TURM-FING-01"))
                .expectNextMatches(b -> b.getId().equals("batch-123"))
                .verifyComplete();
    }

    @Test
    public void testSaveBatch() {
        when(batchRepository.save(any(Batch.class))).thenReturn(Mono.just(sampleBatch));

        StepVerifier.create(batchService.saveBatch(sampleBatch))
                .expectNextMatches(b -> b.getId().equals("batch-123"))
                .verifyComplete();
    }

    @Test
    public void testUpdateBatchState() {
        when(batchRepository.findById("batch-123")).thenReturn(Mono.just(sampleBatch));
        when(batchRepository.save(any(Batch.class))).thenReturn(Mono.just(sampleBatch));

        StepVerifier.create(batchService.updateBatchState("batch-123", Product.LifecycleState.QC_PASSED))
                .expectNextMatches(b -> b.getCurrentState() == Product.LifecycleState.QC_PASSED)
                .verifyComplete();
    }
}
