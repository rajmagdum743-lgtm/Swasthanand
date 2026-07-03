package com.swasthanand.api.controller;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.security.Principal;
import com.swasthanand.api.repository.UserRepository;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final com.swasthanand.api.repository.DealershipNodeRepository dealershipNodeRepository;
    private final UserRepository userRepository;

    @GetMapping
    public Flux<Product> getAllProducts(@RequestParam(required = false) String query, Principal principal) {
        Flux<Product> products;
        if (query != null && !query.isEmpty()) {
            products = productService.searchProducts(query);
        } else {
            products = productService.getAllProducts();
        }

        return products.flatMap(p -> {
            if (p.getIsApproved() != null && p.getIsApproved()) {
                return Mono.just(p);
            }
            if (principal == null) {
                return Mono.empty();
            }
            return userRepository.findByPhone(principal.getName())
                    .flatMap(user -> {
                        if (user.getRole() == com.swasthanand.api.model.User.Role.ADMIN || user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                            return Mono.just(p);
                        }
                        return Mono.empty();
                    })
                    .defaultIfEmpty(p); // Fallback
        });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<Product>> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<Product> createProduct(@RequestBody Product product) {
        return productService.saveProduct(product);
    }

    @PutMapping("/{id}")
    public Mono<Product> updateProduct(@PathVariable String id, @RequestBody Product product) {
        product.setId(id);
        return productService.saveProduct(product);
    }
    
    @PutMapping("/{id}/approve")
    public Mono<Product> approveProduct(@PathVariable String id) {
        return productService.approveProduct(id);
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteProduct(@PathVariable String id) {
        return productService.deleteProduct(id)
                .thenReturn(ResponseEntity.noContent().<Void>build());
    }

    @GetMapping("/batch/{batchId}")
    public Mono<ResponseEntity<Product>> getProductByBatchId(@PathVariable String batchId) {
        return productService.getProductByBatchId(batchId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/node/{nodeId}")
    public Flux<Product> getProductsByDealershipNode(@PathVariable String nodeId) {
        return productService.getProductsByDealershipNode(nodeId);
    }

    @GetMapping("/node/dealer/{dealerId}")
    public Mono<ResponseEntity<com.swasthanand.api.model.DealershipNode>> getDealershipNodeByDealer(@PathVariable String dealerId) {
        return dealershipNodeRepository.findByAssignedDealerId(dealerId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
