package com.swasthanand.api.controller;

import com.swasthanand.api.dto.ProductRequest;
import com.swasthanand.api.dto.ProductResponse;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.UserRepository;
import com.swasthanand.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.security.Principal;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;
    private final com.swasthanand.api.repository.DealershipNodeRepository dealershipNodeRepository;
    private final UserRepository userRepository;

    private Mono<Boolean> hasAccessToProduct(String productId, Principal principal) {
        if (principal == null) {
            return Mono.just(false);
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> {
                    if (user.getRole() == com.swasthanand.api.model.User.Role.ADMIN) {
                        return Mono.just(true);
                    }
                    if (user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                        return productService.getProductById(productId)
                                .flatMap(product -> {
                                    if (product.getDealershipNodeId() == null) {
                                        return Mono.just(false);
                                    }
                                    return dealershipNodeRepository.findByAssignedDealerId(user.getId())
                                            .map(node -> node.getId().equals(product.getDealershipNodeId()))
                                            .defaultIfEmpty(false);
                                })
                                .defaultIfEmpty(false);
                    }
                    return Mono.just(false);
                })
                .defaultIfEmpty(false);
    }

    @GetMapping
    public Flux<ProductResponse> getAllProducts(@RequestParam(required = false) String query, Principal principal) {
        Flux<Product> products = (query != null && !query.isEmpty())
                ? productService.searchProducts(query)
                : productService.getAllProducts();

        return products.flatMap(p -> {
            if (Boolean.TRUE.equals(p.getIsApproved())) {
                return Mono.just(ProductResponse.from(p));
            }
            if (principal == null) {
                return Mono.empty();
            }
            return userRepository.findByPhone(principal.getName())
                    .flatMap(user -> {
                        if (user.getRole() == com.swasthanand.api.model.User.Role.ADMIN || user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                            return Mono.just(ProductResponse.from(p));
                        }
                        return Mono.empty();
                    })
                    .defaultIfEmpty(ProductResponse.from(p));
        });
    }

    @GetMapping("/{id}")
    public Mono<ResponseEntity<ProductResponse>> getProductById(@PathVariable String id) {
        return productService.getProductById(id)
                .map(product -> ResponseEntity.ok(ProductResponse.from(product)))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Mono<ResponseEntity<ProductResponse>> createProduct(@jakarta.validation.Valid @RequestBody ProductRequest request, Principal principal) {
        Product entity = ProductService.toEntity(request);
        if (principal != null) {
            return userRepository.findByPhone(principal.getName())
                    .flatMap(user -> {
                        if (user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                            entity.setDealerId(user.getId());
                            return dealershipNodeRepository.findByAssignedDealerId(user.getId())
                                    .map(node -> {
                                        if (entity.getDealershipNodeId() == null || entity.getDealershipNodeId().isBlank()) {
                                            entity.setDealershipNodeId(node.getId());
                                        }
                                        return entity;
                                    })
                                    .defaultIfEmpty(entity)
                                    .flatMap(productService::saveProduct);
                        }
                        return productService.saveProduct(entity);
                    })
                    .switchIfEmpty(productService.saveProduct(entity))
                    .map(product -> ResponseEntity.ok(ProductResponse.from(product)));
        }
        return productService.saveProduct(entity)
                .map(product -> ResponseEntity.ok(ProductResponse.from(product)));
    }

    @PutMapping("/{id}")
    public Mono<ResponseEntity<ProductResponse>> updateProduct(@PathVariable String id, @jakarta.validation.Valid @RequestBody ProductRequest request, Principal principal) {
        return hasAccessToProduct(id, principal)
                .flatMap(hasAccess -> {
                    if (!hasAccess) {
                        return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to update this product"));
                    }
                    Product product = ProductService.toEntity(request);
                    product.setId(id);
                    return productService.saveProduct(product)
                            .map(updated -> ResponseEntity.ok(ProductResponse.from(updated)));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/approve")
    public Mono<ResponseEntity<ProductResponse>> approveProduct(@PathVariable String id) {
        return productService.approveProduct(id)
                .map(product -> ResponseEntity.ok(ProductResponse.from(product)));
    }

    @DeleteMapping("/{id}")
    public Mono<ResponseEntity<Void>> deleteProduct(@PathVariable String id) {
        return productService.deleteProduct(id)
                .thenReturn(ResponseEntity.noContent().<Void>build());
    }

    @GetMapping("/batch/{batchId}")
    public Mono<ResponseEntity<ProductResponse>> getProductByBatchId(@PathVariable String batchId) {
        return productService.getProductByBatchId(batchId)
                .map(product -> ResponseEntity.ok(ProductResponse.from(product)))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/node/{nodeId}")
    public Flux<ProductResponse> getProductsByDealershipNode(@PathVariable String nodeId, Principal principal) {
        if (principal == null) {
            return productService.getProductsByDealershipNode(nodeId).map(ProductResponse::from);
        }
        return userRepository.findByPhone(principal.getName())
                .flatMapMany(user -> {
                    if (user.getRole() == com.swasthanand.api.model.User.Role.ADMIN || user.getRole() == com.swasthanand.api.model.User.Role.CUSTOMER) {
                        return productService.getProductsByDealershipNode(nodeId).map(ProductResponse::from);
                    }
                    if (user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                        return dealershipNodeRepository.findByAssignedDealerId(user.getId())
                                .flatMapMany(node -> {
                                    if (!node.getId().equals(nodeId)) {
                                        return Flux.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this node's inventory"));
                                    }
                                    return productService.getProductsByDealershipNode(nodeId).map(ProductResponse::from);
                                })
                                .switchIfEmpty(Flux.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "No node assigned to this dealer")));
                    }
                    return Flux.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied"));
                })
                .defaultIfEmpty(ProductResponse.from(new Product())); // fallback empty handler
    }

    @GetMapping("/node/dealer/{dealerId}")
    public Mono<ResponseEntity<com.swasthanand.api.model.DealershipNode>> getDealershipNodeByDealer(@PathVariable String dealerId) {
        return dealershipNodeRepository.findByAssignedDealerId(dealerId)
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
