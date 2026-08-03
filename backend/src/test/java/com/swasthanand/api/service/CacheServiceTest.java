package com.swasthanand.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.core.ReactiveValueOperations;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.time.Duration;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CacheServiceTest {

    @Mock
    private ReactiveRedisTemplate<String, Object> redisTemplate;

    @Mock
    private ReactiveValueOperations<String, Object> valueOperations;

    private CacheService cacheService;

    @BeforeEach
    public void setUp() {
        cacheService = new CacheService(redisTemplate);
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOperations);
    }

    @Test
    public void testGet() {
        when(valueOperations.get("test-key")).thenReturn(Mono.just("test-value"));

        StepVerifier.create(cacheService.get("test-key"))
                .expectNext("test-value")
                .verifyComplete();
    }

    @Test
    public void testPut() {
        when(valueOperations.set(eq("test-key"), eq("test-value"), any(Duration.class)))
                .thenReturn(Mono.just(true));

        StepVerifier.create(cacheService.put("test-key", "test-value", 10))
                .verifyComplete();
    }

    @Test
    public void testEvict() {
        when(valueOperations.delete("test-key")).thenReturn(Mono.just(true));

        StepVerifier.create(cacheService.evict("test-key"))
                .verifyComplete();
    }

    @Test
    public void testInvalidations() {
        when(valueOperations.delete(anyString())).thenReturn(Mono.just(true));

        StepVerifier.create(cacheService.invalidateCatalog()).verifyComplete();
        StepVerifier.create(cacheService.invalidateDealerDashboard("dealer-1")).verifyComplete();
        StepVerifier.create(cacheService.invalidateInventorySummary("node-1")).verifyComplete();
        StepVerifier.create(cacheService.invalidateSession("phone-1")).verifyComplete();
        StepVerifier.create(cacheService.invalidatePopularProducts()).verifyComplete();
    }
}
