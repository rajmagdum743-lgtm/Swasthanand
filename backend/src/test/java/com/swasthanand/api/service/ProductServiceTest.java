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
    private ReactiveValueOperations<String, Object> valueOperations;

    private ProductService productService;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        productService = new ProductService(productRepository, redisTemplate);
        sampleProduct = Product.builder()
                .id("prod-123")
                .name("Pure A2 Vedic Ghee")
                .price(new BigDecimal("1200"))
                .tags(List.of("immunity", "digestion"))
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
        when(productRepository.save(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.set(eq("product::prod-123"), any())).thenReturn(Mono.just(true));

        StepVerifier.create(productService.saveProduct(sampleProduct))
                .expectNextMatches(p -> p.getId().equals("prod-123"))
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
}
