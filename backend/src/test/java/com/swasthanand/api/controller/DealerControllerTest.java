package com.swasthanand.api.controller;

import com.swasthanand.api.model.DealershipNode;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.model.User;
import com.swasthanand.api.repository.*;
import com.swasthanand.api.service.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.security.Principal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class DealerControllerTest {

    @Mock private UserRepository userRepository;
    @Mock private DealershipNodeRepository dealershipNodeRepository;
    @Mock private ProductService productService;
    @Mock private ProductRepository productRepository;
    @Mock private OrderService orderService;
    @Mock private OrderRepository orderRepository;
    @Mock private CacheService cacheService;
    @Mock private ApplicationEventPublisher eventPublisher;
    @Mock private DealerAlertRepository dealerAlertRepository;
    @Mock private DealerCertificationRepository dealerCertificationRepository;
    @Mock private InventoryHistoryRepository inventoryHistoryRepository;
    @Mock private ProductLifecycleStateMachine stateMachine;
    @Mock private ReactiveRedisTemplate<String, Object> redisTemplate;
    @Mock private ReactiveValueOperations<String, Object> valueOperations;
    @Mock private Principal principal;

    private DealerController dealerController;
    private User dealerUser;
    private DealershipNode dealerNode;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        dealerController = new DealerController(
                userRepository, dealershipNodeRepository, productService,
                productRepository, orderService, orderRepository,
                cacheService, eventPublisher, dealerAlertRepository,
                dealerCertificationRepository, stateMachine, redisTemplate,
                inventoryHistoryRepository
        );

        dealerUser = User.builder()
                .id("dealer-user-1")
                .phone("9876543210")
                .name("Test Dealer")
                .role(User.Role.DEALER)
                .build();

        dealerNode = DealershipNode.builder()
                .id("node-dealer-user-1")
                .name("Dealer Node")
                .assignedDealerId("dealer-user-1")
                .build();

        sampleProduct = Product.builder()
                .id("prod-100")
                .name("Organic Turmeric")
                .dealerId("dealer-user-1")
                .dealershipNodeId("node-dealer-user-1")
                .status(Product.LifecycleState.DEALER_ALLOCATED)
                .stock(50)
                .build();

        lenient().when(principal.getName()).thenReturn("9876543210");
        lenient().when(userRepository.findByPhone("9876543210")).thenReturn(Mono.just(dealerUser));
        lenient().when(dealershipNodeRepository.findByAssignedDealerId("dealer-user-1")).thenReturn(Mono.just(dealerNode));
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.delete(anyString())).thenReturn(Mono.just(true));
        lenient().when(cacheService.invalidateDealerDashboard(anyString())).thenReturn(Mono.empty());
        lenient().when(cacheService.invalidateInventorySummary(anyString())).thenReturn(Mono.empty());
    }

    @Test
    public void testTransitionProductLifecycle_Success() {
        Product updatedProduct = Product.builder()
                .id("prod-100")
                .name("Organic Turmeric")
                .dealerId("dealer-user-1")
                .dealershipNodeId("node-dealer-user-1")
                .status(Product.LifecycleState.IN_TRANSIT)
                .stock(50)
                .build();

        when(productRepository.findById("prod-100")).thenReturn(Mono.just(sampleProduct));
        when(stateMachine.triggerTransition(eq("prod-100"), eq(ProductLifecycleStateMachine.LifecycleEvent.SHIP), anyString()))
                .thenReturn(Mono.just(updatedProduct));

        StepVerifier.create(dealerController.transitionProductLifecycle("prod-100", Map.of("event", "SHIP"), principal))
                .expectNextMatches(response -> {
                    assertEquals(HttpStatus.OK, response.getStatusCode());
                    assertNotNull(response.getBody());
                    assertEquals(Product.LifecycleState.IN_TRANSIT, response.getBody().getStatus());
                    return true;
                })
                .verifyComplete();
    }

    @Test
    public void testTransitionProductLifecycle_UnauthorizedProduct() {
        Product otherProduct = Product.builder()
                .id("prod-200")
                .name("Other Dealer Product")
                .dealerId("other-dealer-999")
                .dealershipNodeId("other-node-999")
                .status(Product.LifecycleState.DEALER_ALLOCATED)
                .build();

        when(productRepository.findById("prod-200")).thenReturn(Mono.just(otherProduct));

        StepVerifier.create(dealerController.transitionProductLifecycle("prod-200", Map.of("event", "SHIP"), principal))
                .expectErrorMatches(throwable -> throwable instanceof ResponseStatusException &&
                        ((ResponseStatusException) throwable).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testTransitionProductLifecycle_InvalidTransition() {
        when(productRepository.findById("prod-100")).thenReturn(Mono.just(sampleProduct));
        when(stateMachine.triggerTransition(eq("prod-100"), eq(ProductLifecycleStateMachine.LifecycleEvent.SUBMIT_QC), anyString()))
                .thenReturn(Mono.error(new IllegalArgumentException("Invalid state transition from DEALER_ALLOCATED via event SUBMIT_QC")));

        StepVerifier.create(dealerController.transitionProductLifecycle("prod-100", Map.of("event", "SUBMIT_QC"), principal))
                .expectErrorMatches(throwable -> throwable instanceof ResponseStatusException &&
                        ((ResponseStatusException) throwable).getStatusCode() == HttpStatus.BAD_REQUEST)
                .verify();
    }

    @Test
    public void testGetInventoryHistory_Success() {
        com.swasthanand.api.model.InventoryHistory historyRecord = com.swasthanand.api.model.InventoryHistory.builder()
                .id("hist-1")
                .productId("prod-100")
                .changeQuantity(10)
                .resultingStock(60)
                .reason("Manual Adjustment")
                .performedBy("Test Dealer")
                .build();

        when(productRepository.findById("prod-100")).thenReturn(Mono.just(sampleProduct));
        when(inventoryHistoryRepository.findByProductIdOrderByTimestampDesc("prod-100")).thenReturn(reactor.core.publisher.Flux.just(historyRecord));

        StepVerifier.create(dealerController.getInventoryHistory("prod-100", principal))
                .expectNextMatches(h -> h.getId().equals("hist-1") && h.getChangeQuantity() == 10)
                .verifyComplete();
    }
}
