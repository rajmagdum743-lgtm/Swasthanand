package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.ReactiveRedisTemplate;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ReactiveRedisTemplate<String, Object> redisTemplate;
    private static final String CACHE_PREFIX = "product::";

    public Flux<Product> getAllProducts() {
        return productRepository.findAll()
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Flux<Product> searchProducts(String query) {
        return productRepository.findByNameContainingIgnoreCase(query)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Mono<Product> getProductById(String id) {
        String key = CACHE_PREFIX + id;
        return redisTemplate.opsForValue().get(key)
                .map(cached -> {
                    Product p = (Product) cached;
                    p.deserializeTags();
                    return p;
                })
                .switchIfEmpty(Mono.defer(() ->
                        productRepository.findById(id)
                                .flatMap(product -> {
                                    product.deserializeTags();
                                    return redisTemplate.opsForValue().set(key, product)
                                            .thenReturn(product);
                                })
                ));
    }

    public Mono<Product> saveProduct(Product product) {
        product.serializeTags();
        return productRepository.save(product)
                .flatMap(savedProduct -> {
                    savedProduct.deserializeTags();
                    String key = CACHE_PREFIX + savedProduct.getId();
                    return redisTemplate.opsForValue().set(key, savedProduct)
                            .thenReturn(savedProduct);
                });
    }

    public Mono<Void> deleteProduct(String id) {
        String key = CACHE_PREFIX + id;
        return productRepository.deleteById(id)
                .then(redisTemplate.opsForValue().delete(key))
                .then();
    }

    public Mono<Product> getProductByBatchId(String batchId) {
        return productRepository.findByBatchId(batchId)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }

    public Flux<Product> getProductsByDealershipNode(String dealershipNodeId) {
        return productRepository.findByDealershipNodeId(dealershipNodeId)
                .map(product -> {
                    product.deserializeTags();
                    return product;
                });
    }
}
