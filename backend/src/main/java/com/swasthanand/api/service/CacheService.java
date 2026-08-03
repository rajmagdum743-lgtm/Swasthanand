package com.swasthanand.api.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.time.Duration;

@Service
@RequiredArgsConstructor
public class CacheService {

    private final ReactiveRedisTemplate<String, Object> redisTemplate;

    public Mono<Void> put(String key, Object value, long ttlMinutes) {
        return Mono.defer(() -> redisTemplate.opsForValue().set(key, value, Duration.ofMinutes(ttlMinutes)))
                .onErrorResume(err -> Mono.empty())
                .then();
    }

    public Mono<Object> get(String key) {
        return Mono.defer(() -> redisTemplate.opsForValue().get(key))
                .onErrorResume(err -> Mono.empty());
    }

    public Mono<Void> evict(String key) {
        return Mono.defer(() -> redisTemplate.opsForValue().delete(key))
                .onErrorResume(err -> Mono.empty())
                .then();
    }

    // Invalidation shortcuts
    public Mono<Void> invalidateCatalog() {
        return evict("products::catalog");
    }

    public Mono<Void> invalidateDealerDashboard(String dealerId) {
        return evict("dealer::dashboard::" + dealerId);
    }

    public Mono<Void> invalidateInventorySummary(String nodeId) {
        return evict("inventory::summary::" + nodeId);
    }

    public Mono<Void> invalidateSession(String phone) {
        return evict("session::" + phone);
    }

    public Mono<Void> invalidatePopularProducts() {
        return evict("products::popular");
    }
}
