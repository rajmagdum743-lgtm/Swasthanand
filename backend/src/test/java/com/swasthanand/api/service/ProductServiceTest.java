package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.math.BigDecimal;
import java.util.List;
import java.time.LocalDate;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ReactiveRedisTemplate<String, Object> redisTemplate;

    @Mock
    private com.swasthanand.api.repository.ProductNotificationRepository notificationRepository;

    @Mock
    private org.springframework.context.ApplicationEventPublisher eventPublisher;

    @Mock
    private ReactiveValueOperations<String, Object> valueOperations;

    private ProductService productService;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        productService = new ProductService(productRepository, notificationRepository, redisTemplate, eventPublisher);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        lenient().when(valueOperations.delete(anyString())).thenReturn(Mono.just(true));
        
        sampleProduct = Product.builder()
                .id("prod-123")
                .name("Pure A2 Vedic Ghee")
                .price(new BigDecimal("1200"))
                .tags(List.of("immunity", "digestion"))
                .stock(100)
                .build();
    }

    @Test
    public void testGetAllProducts() {
        when(productRepository.findAll()).thenReturn(Flux.just(sampleProduct));

        StepVerifier.create(productService.getAllProducts())
                .expectNextMatches(p -> p.getName().equals("Pure A2 Vedic Ghee"))
                .verifyComplete();
    }

    @Test
    public void testGetProductById_CacheHit() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("product::prod-123")).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(productService.getProductById("prod-123"))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
                .verifyComplete();

        verify(productRepository, never()).findById(anyString());
    }

    @Test
    public void testGetProductById_CacheMiss() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.get("product::prod-123")).thenReturn(Mono.empty());
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.getProductById("prod-123"))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
                .verifyComplete();

        verify(productRepository, times(1)).findById("prod-123");
    }

    @Test
    public void testSaveProduct() {
        when(productRepository.findById(anyString())).thenReturn(Mono.empty());
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.saveProduct(sampleProduct))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
                .verifyComplete();
    }

    @Test
    public void testIncrementStock() {
        when(productRepository.findByIdForUpdate("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.incrementStock("prod-123", 5, "System", "Replenishment"))
                .expectNextMatches(p -> p.getStock() == 105)
                .verifyComplete();
    }

    @Test
    public void testDecrementStock() {
        when(productRepository.findByIdForUpdate("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.decrementStock("prod-123", 10, "System", "Sale"))
                .expectNextMatches(p -> p.getStock() == 90)
                .verifyComplete();
    }

    @Test
    public void testApproveProduct() {
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.approveProduct("prod-123"))
                .expectNextMatches(p -> p.getIsApproved() == true)
                .verifyComplete();
    }

    @Test
    public void testDeleteProduct() {
        when(productRepository.deleteById("prod-123")).thenReturn(Mono.empty());
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.delete("product::prod-123")).thenReturn(Mono.just(true));

        StepVerifier.create(productService.deleteProduct("prod-123"))
                .verifyComplete();
    }

    @Test
    public void testReserveStock() {
        when(productRepository.findByIdForUpdate("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.reserveStock("prod-123", 10, "System", "Cart reservation"))
                .expectNextMatches(p -> p.getStock() == 90)
                .verifyComplete();
    }

    @Test
    public void testReleaseStock() {
        when(productRepository.findByIdForUpdate("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.findById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.releaseStock("prod-123", 10, "System", "Cart expiration"))
                .expectNextMatches(p -> p.getStock() == 110)
                .verifyComplete();
    }

    @Test
    public void testGetProductByBatchId() {
        when(productRepository.findByBatchId("batch-123")).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(productService.getProductByBatchId("batch-123"))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
                .verifyComplete();
    }

    @Test
    public void testGetProductsByDealershipNode() {
        when(productRepository.findByDealershipNodeId("node-123")).thenReturn(Flux.just(sampleProduct));

        StepVerifier.create(productService.getProductsByDealershipNode("node-123"))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
                .verifyComplete();
    }

    @Test
    public void testIncrementStock_NegativeQuantity() {
        StepVerifier.create(productService.incrementStock("prod-123", -5, "System", "Error"))
                .expectError(IllegalArgumentException.class)
                .verify();
    }

    @Test
    public void testDecrementStock_NegativeQuantity() {
        StepVerifier.create(productService.decrementStock("prod-123", -5, "System", "Error"))
                .expectError(IllegalArgumentException.class)
                .verify();
    }

    @Test
    public void testDecrementStock_InsufficientStock() {
        when(productRepository.findByIdForUpdate("prod-123")).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(productService.decrementStock("prod-123", 200, "System", "Error"))
                .expectError(IllegalArgumentException.class)
                .verify();
    }

    @Test
    public void testIncrementStock_ProductNotFound() {
        when(productRepository.findByIdForUpdate("prod-999")).thenReturn(Mono.empty());

        StepVerifier.create(productService.incrementStock("prod-999", 10, "System", "Error"))
                .expectError(IllegalArgumentException.class)
                .verify();
    }

    @Test
    public void testToEntity() {
        com.swasthanand.api.dto.ProductRequest request = com.swasthanand.api.dto.ProductRequest.builder()
                .id("p-999")
                .name("Turmeric Finger")
                .sku("TURM-FING-01")
                .price(new BigDecimal("299"))
                .description("Desc")
                .benefitsDescription("Benefits")
                .category("Spices")
                .tags(List.of("immunity"))
                .batchId("b-123")
                .origin("Sangli")
                .image("img")
                .stock(100)
                .isApproved(true)
                .harvestDate("2026-07-18")
                .weatherTemp("28c")
                .growthQuality("Good")
                .organicMatter("5%")
                .nitrogen("2%")
                .zeroPesticides("Yes")
                .certificateUrl("url")
                .status(Product.LifecycleState.QC_PASSED)
                .dealershipNodeId("node-1")
                .expiryDate(LocalDate.now().plusMonths(12))
                .build();

        Product entity = ProductService.toEntity(request);
        assertNotNull(entity);
        assertEquals("p-999", entity.getId());
        assertEquals("Turmeric Finger", entity.getName());
    }
}
