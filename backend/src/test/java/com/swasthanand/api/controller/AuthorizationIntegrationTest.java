package com.swasthanand.api.controller;

import com.swasthanand.api.model.*;
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
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import java.security.Principal;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthorizationIntegrationTest {

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
    @Mock private ProductLifecycleStateMachine stateMachine;
    @Mock private ReactiveRedisTemplate<String, Object> redisTemplate;
    @Mock private InventoryHistoryRepository inventoryHistoryRepository;

    @Mock private ReactiveValueOperations<String, Object> valueOperations;
    @Mock private Principal dealerAPrincipal;
    @Mock private Principal dealerBPrincipal;

    private DealerController dealerController;

    private User dealerAUser;
    private User dealerBUser;
    private DealershipNode dealerANode;
    private DealershipNode dealerBNode;
    private Product dealerAProduct;
    private Product dealerBProduct;
    private DealerCertification dealerACert;
    private DealerAlert dealerAAlert;

    @BeforeEach
    public void setUp() {
        dealerController = new DealerController(
                userRepository, dealershipNodeRepository, productService,
                productRepository, orderService, orderRepository,
                cacheService, eventPublisher, dealerAlertRepository,
                dealerCertificationRepository, stateMachine, redisTemplate,
                inventoryHistoryRepository
        );

        dealerAUser = User.builder()
                .id("dealer-a-id")
                .phone("9111111111")
                .name("Dealer A")
                .role(User.Role.DEALER)
                .build();

        dealerBUser = User.builder()
                .id("dealer-b-id")
                .phone("9222222222")
                .name("Dealer B")
                .role(User.Role.DEALER)
                .build();

        dealerANode = DealershipNode.builder()
                .id("node-dealer-a")
                .name("Dealer A Node")
                .assignedDealerId("dealer-a-id")
                .build();

        dealerBNode = DealershipNode.builder()
                .id("node-dealer-b")
                .name("Dealer B Node")
                .assignedDealerId("dealer-b-id")
                .build();

        dealerAProduct = Product.builder()
                .id("prod-a")
                .name("Dealer A Product")
                .dealerId("dealer-a-id")
                .dealershipNodeId("node-dealer-a")
                .status(Product.LifecycleState.DEALER_ALLOCATED)
                .stock(50)
                .build();

        dealerBProduct = Product.builder()
                .id("prod-b")
                .name("Dealer B Product")
                .dealerId("dealer-b-id")
                .dealershipNodeId("node-dealer-b")
                .status(Product.LifecycleState.DEALER_ALLOCATED)
                .stock(100)
                .build();

        dealerACert = DealerCertification.builder()
                .id("cert-a")
                .dealerId("dealer-a-id")
                .title("Organic License A")
                .fileUrl("http://localhost:8081/certA.pdf")
                .verificationStatus("VERIFIED")
                .build();

        dealerAAlert = DealerAlert.builder()
                .id("alert-a")
                .dealerId("dealer-a-id")
                .subject("Restock Notice A")
                .message("Low stock warning")
                .isRead(false)
                .build();

        lenient().when(dealerAPrincipal.getName()).thenReturn("9111111111");
        lenient().when(dealerBPrincipal.getName()).thenReturn("9222222222");

        lenient().when(userRepository.findByPhone("9111111111")).thenReturn(Mono.just(dealerAUser));
        lenient().when(userRepository.findByPhone("9222222222")).thenReturn(Mono.just(dealerBUser));

        lenient().when(dealershipNodeRepository.findByAssignedDealerId("dealer-a-id")).thenReturn(Mono.just(dealerANode));
        lenient().when(dealershipNodeRepository.findByAssignedDealerId("dealer-b-id")).thenReturn(Mono.just(dealerBNode));

        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.delete(anyString())).thenReturn(Mono.just(true));
        lenient().when(cacheService.invalidateDealerDashboard(anyString())).thenReturn(Mono.empty());
        lenient().when(cacheService.invalidateInventorySummary(anyString())).thenReturn(Mono.empty());
    }

    @Test
    public void testDealerA_AccessOwnProductLifecycle_Success() {
        Product updatedProduct = Product.builder()
                .id("prod-a")
                .name("Dealer A Product")
                .dealerId("dealer-a-id")
                .dealershipNodeId("node-dealer-a")
                .status(Product.LifecycleState.IN_TRANSIT)
                .stock(50)
                .build();

        when(productRepository.findById("prod-a")).thenReturn(Mono.just(dealerAProduct));
        when(stateMachine.triggerTransition(eq("prod-a"), eq(ProductLifecycleStateMachine.LifecycleEvent.SHIP), anyString()))
                .thenReturn(Mono.just(updatedProduct));

        StepVerifier.create(dealerController.transitionProductLifecycle("prod-a", Map.of("event", "SHIP"), dealerAPrincipal))
                .expectNextMatches(resp -> resp.getStatusCode() == HttpStatus.OK && resp.getBody().getStatus() == Product.LifecycleState.IN_TRANSIT)
                .verifyComplete();
    }

    @Test
    public void testDealerA_ModifyDealerBProductLifecycle_Denied() {
        when(productRepository.findById("prod-b")).thenReturn(Mono.just(dealerBProduct));

        StepVerifier.create(dealerController.transitionProductLifecycle("prod-b", Map.of("event", "SHIP"), dealerAPrincipal))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testDealerA_AdjustDealerBStock_Denied() {
        when(productRepository.findById("prod-b")).thenReturn(Mono.just(dealerBProduct));

        StepVerifier.create(dealerController.adjustStock("prod-b", Map.of("action", "INCREMENT", "quantity", 10), dealerAPrincipal))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testDealerA_GetDealerBInventoryHistory_Denied() {
        when(productRepository.findById("prod-b")).thenReturn(Mono.just(dealerBProduct));

        StepVerifier.create(dealerController.getInventoryHistory("prod-b", dealerAPrincipal))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testDealerB_UpdateDealerACertification_Denied() {
        when(dealerCertificationRepository.findById("cert-a")).thenReturn(Mono.just(dealerACert));

        DealerCertification updateReq = DealerCertification.builder().title("Hacked Title").build();

        StepVerifier.create(dealerController.updateDealerCertification("cert-a", updateReq, dealerBPrincipal))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testDealerB_DeleteDealerAAlert_Denied() {
        when(dealerAlertRepository.findById("alert-a")).thenReturn(Mono.just(dealerAAlert));

        StepVerifier.create(dealerController.deleteDealerAlert("alert-a", dealerBPrincipal))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.FORBIDDEN)
                .verify();
    }

    @Test
    public void testUnauthenticatedRequest_ReturnsUnauthorized() {
        StepVerifier.create(dealerController.getDealerCertifications(null))
                .expectErrorMatches(t -> t instanceof ResponseStatusException && ((ResponseStatusException) t).getStatusCode() == HttpStatus.UNAUTHORIZED)
                .verify();
    }
}
