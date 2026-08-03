package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.model.Batch;
import com.swasthanand.api.repository.ProductRepository;
import com.swasthanand.api.repository.BatchRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.time.LocalDate;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class LifecycleSchedulerTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private BatchRepository batchRepository;

    @Mock
    private ProductLifecycleStateMachine stateMachine;

    @Mock
    private BatchService batchService;

    private LifecycleScheduler scheduler;

    @BeforeEach
    public void setUp() {
        scheduler = new LifecycleScheduler(productRepository, batchRepository, stateMachine, batchService);
    }

    @Test
    public void testRunAutomatedUpdates_WithData() {
        Product mockProduct = Product.builder().id("p-123").sku("TURM-FING-01").name("Turmeric").stock(5).build();
        Batch nearExpiryBatch = Batch.builder()
                .id("b-near")
                .sku("TURM-FING-01")
                .expiryDate(LocalDate.now().plusDays(3))
                .build();
        Batch oldDestroyedBatch = Batch.builder()
                .id("b-old")
                .sku("TURM-FING-01")
                .currentState(Product.LifecycleState.DESTROYED)
                .expiryDate(LocalDate.now().minusDays(45))
                .build();
        
        when(productRepository.findExpiredProducts(any(LocalDate.class))).thenReturn(Flux.just(mockProduct));
        when(stateMachine.triggerTransition(eq("p-123"), eq(ProductLifecycleStateMachine.LifecycleEvent.EXPIRE), anyString()))
                .thenReturn(Mono.just(mockProduct));

        when(batchRepository.findExpiredBatches(any(LocalDate.class))).thenReturn(Flux.just(oldDestroyedBatch));
        when(batchService.updateBatchState(eq("b-old"), eq(Product.LifecycleState.EXPIRED)))
                .thenReturn(Mono.just(oldDestroyedBatch));

        when(productRepository.findLowStockProducts(10)).thenReturn(Flux.just(mockProduct));
        when(batchRepository.findAll()).thenReturn(Flux.just(nearExpiryBatch, oldDestroyedBatch));
        when(batchRepository.delete(any(Batch.class))).thenReturn(Mono.empty());

        scheduler.runAutomatedUpdates();

        verify(productRepository, times(1)).findExpiredProducts(any(LocalDate.class));
        verify(batchRepository, times(1)).findExpiredBatches(any(LocalDate.class));
        verify(productRepository, times(1)).findLowStockProducts(10);
        verify(batchRepository, times(1)).delete(eq(oldDestroyedBatch));
    }
}
