package com.swasthanand.api.controller;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public Flux<Product> getAllProducts(@RequestParam(required = false) String query) {
        if (query != null && !query.isEmpty()) {
            return productService.searchProducts(query);
        }
        return productService.getAllProducts();
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
}
