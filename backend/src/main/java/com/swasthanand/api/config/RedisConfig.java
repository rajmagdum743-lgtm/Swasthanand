package com.swasthanand.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis configuration.
 *
 * <p>Provides a {@link ReactiveRedisTemplate}&lt;String, Object&gt; used by
 * {@link com.swasthanand.api.service.ProductService} for product caching.</p>
 *
 * <p><b>OTP storage does NOT use Redis.</b> OTPs are stored in an in-process
 * {@link java.util.concurrent.ConcurrentHashMap} inside
 * {@link com.swasthanand.api.service.OtpService}, so the application starts
 * and handles OTP flows correctly even when Redis is unavailable.</p>
 */
@Configuration
public class RedisConfig {

    /**
     * General-purpose reactive template with Jackson JSON serialisation.
     * Used by {@link com.swasthanand.api.service.ProductService} to cache
     * individual product entries.
     */
    @Bean
    public ReactiveRedisTemplate<String, Object> reactiveRedisTemplate(ReactiveRedisConnectionFactory factory) {
        StringRedisSerializer keySerializer = new StringRedisSerializer();
        Jackson2JsonRedisSerializer<Object> valueSerializer = new Jackson2JsonRedisSerializer<>(Object.class);

        RedisSerializationContext<String, Object> context =
                RedisSerializationContext.<String, Object>newSerializationContext(keySerializer)
                        .value(valueSerializer)
                        .hashKey(keySerializer)
                        .hashValue(valueSerializer)
                        .build();

        return new ReactiveRedisTemplate<>(factory, context);
    }
}
