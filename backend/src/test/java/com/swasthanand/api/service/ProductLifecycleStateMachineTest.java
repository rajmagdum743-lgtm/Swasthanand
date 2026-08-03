package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
public class ProductLifecycleStateMachineTest {

    @Mock
    private ProductRepository productRepository;

    private ProductLifecycleStateMachine stateMachine;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        stateMachine = new ProductLifecycleStateMachine(productRepository);
        sampleProduct = Product.builder()
                .id("prod-123")
                .status(Product.LifecycleState.MANUFACTURED)
                .build();
    }

    @Test
    public void testComputeNextState_ValidTransitions() {
        assertEquals(Product.LifecycleState.QC_PENDING, 
                stateMachine.computeNextState(Product.LifecycleState.MANUFACTURED, ProductLifecycleStateMachine.LifecycleEvent.SUBMIT_QC));
        
        assertEquals(Product.LifecycleState.QC_PASSED, 
                stateMachine.computeNextState(Product.LifecycleState.QC_PENDING, ProductLifecycleStateMachine.LifecycleEvent.PASS_QC));

        assertEquals(Product.LifecycleState.DESTROYED, 
                stateMachine.computeNextState(Product.LifecycleState.QC_PENDING, ProductLifecycleStateMachine.LifecycleEvent.FAIL_QC));

        assertEquals(Product.LifecycleState.WAREHOUSE, 
                stateMachine.computeNextState(Product.LifecycleState.QC_PASSED, ProductLifecycleStateMachine.LifecycleEvent.SEND_TO_WAREHOUSE));

        assertEquals(Product.LifecycleState.DEALER_ALLOCATED, 
                stateMachine.computeNextState(Product.LifecycleState.QC_PASSED, ProductLifecycleStateMachine.LifecycleEvent.ALLOCATE_DEALER));

        assertEquals(Product.LifecycleState.DEALER_ALLOCATED, 
                stateMachine.computeNextState(Product.LifecycleState.WAREHOUSE, ProductLifecycleStateMachine.LifecycleEvent.ALLOCATE_DEALER));

        assertEquals(Product.LifecycleState.IN_TRANSIT, 
                stateMachine.computeNextState(Product.LifecycleState.DEALER_ALLOCATED, ProductLifecycleStateMachine.LifecycleEvent.SHIP));

        assertEquals(Product.LifecycleState.SOLD, 
                stateMachine.computeNextState(Product.LifecycleState.DEALER_ALLOCATED, ProductLifecycleStateMachine.LifecycleEvent.PURCHASE));

        assertEquals(Product.LifecycleState.DELIVERED, 
                stateMachine.computeNextState(Product.LifecycleState.IN_TRANSIT, ProductLifecycleStateMachine.LifecycleEvent.DELIVER));

        assertEquals(Product.LifecycleState.RETURNED, 
                stateMachine.computeNextState(Product.LifecycleState.IN_TRANSIT, ProductLifecycleStateMachine.LifecycleEvent.RETURN));

        assertEquals(Product.LifecycleState.SOLD, 
                stateMachine.computeNextState(Product.LifecycleState.DELIVERED, ProductLifecycleStateMachine.LifecycleEvent.PURCHASE));

        assertEquals(Product.LifecycleState.RETURNED, 
                stateMachine.computeNextState(Product.LifecycleState.DELIVERED, ProductLifecycleStateMachine.LifecycleEvent.RETURN));

        assertEquals(Product.LifecycleState.RETURNED, 
                stateMachine.computeNextState(Product.LifecycleState.SOLD, ProductLifecycleStateMachine.LifecycleEvent.RETURN));

        assertEquals(Product.LifecycleState.WAREHOUSE, 
                stateMachine.computeNextState(Product.LifecycleState.RETURNED, ProductLifecycleStateMachine.LifecycleEvent.SEND_TO_WAREHOUSE));
    }

    @Test
    public void testComputeNextState_ExpireEvent() {
        // Valid expire transitions
        assertEquals(Product.LifecycleState.EXPIRED, stateMachine.computeNextState(Product.LifecycleState.QC_PASSED, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));
        assertEquals(Product.LifecycleState.EXPIRED, stateMachine.computeNextState(Product.LifecycleState.WAREHOUSE, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));
        assertEquals(Product.LifecycleState.EXPIRED, stateMachine.computeNextState(Product.LifecycleState.DEALER_ALLOCATED, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));
        assertEquals(Product.LifecycleState.EXPIRED, stateMachine.computeNextState(Product.LifecycleState.IN_TRANSIT, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));
        assertEquals(Product.LifecycleState.EXPIRED, stateMachine.computeNextState(Product.LifecycleState.DELIVERED, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));

        // Invalid expire transitions
        assertNull(stateMachine.computeNextState(Product.LifecycleState.SOLD, ProductLifecycleStateMachine.LifecycleEvent.EXPIRE));
    }

    @Test
    public void testComputeNextState_DestroyEvent() {
        // Valid destroy transitions
        assertEquals(Product.LifecycleState.DESTROYED, stateMachine.computeNextState(Product.LifecycleState.EXPIRED, ProductLifecycleStateMachine.LifecycleEvent.DESTROY));
        assertEquals(Product.LifecycleState.DESTROYED, stateMachine.computeNextState(Product.LifecycleState.RETURNED, ProductLifecycleStateMachine.LifecycleEvent.DESTROY));
        assertEquals(Product.LifecycleState.DESTROYED, stateMachine.computeNextState(Product.LifecycleState.QC_PENDING, ProductLifecycleStateMachine.LifecycleEvent.DESTROY));
        assertEquals(Product.LifecycleState.DESTROYED, stateMachine.computeNextState(Product.LifecycleState.MANUFACTURED, ProductLifecycleStateMachine.LifecycleEvent.DESTROY));

        // Invalid destroy transitions
        assertNull(stateMachine.computeNextState(Product.LifecycleState.SOLD, ProductLifecycleStateMachine.LifecycleEvent.DESTROY));
    }

    @Test
    public void testComputeNextState_InvalidTransitions() {
        assertNull(stateMachine.computeNextState(Product.LifecycleState.MANUFACTURED, ProductLifecycleStateMachine.LifecycleEvent.PURCHASE));
        assertNull(stateMachine.computeNextState(Product.LifecycleState.SOLD, ProductLifecycleStateMachine.LifecycleEvent.SHIP));
    }

    @Test
    public void testTriggerTransition_Success() {
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(stateMachine.triggerTransition("prod-123", ProductLifecycleStateMachine.LifecycleEvent.SUBMIT_QC, ""))
                .expectNextMatches(p -> p.getStatus() == Product.LifecycleState.QC_PENDING)
                .verifyComplete();
    }



    @Test
    public void testTriggerTransition_Failure_Invalid() {
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(stateMachine.triggerTransition("prod-123", ProductLifecycleStateMachine.LifecycleEvent.PURCHASE, ""))
                .expectError(IllegalArgumentException.class)
                .verify();
    }
}
