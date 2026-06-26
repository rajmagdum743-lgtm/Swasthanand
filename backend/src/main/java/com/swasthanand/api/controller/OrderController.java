package com.swasthanand.api.controller;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public Mono<Order> createOrder(@RequestBody Order order) {
        return orderService.createOrder(order);
    }

    @GetMapping("/user/{userId}")
    public Flux<Order> getOrdersByUser(@PathVariable String userId) {
        return orderService.getOrdersByUser(userId);
    }

    @GetMapping
    public Flux<Order> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/{id}/status")
    public Mono<ResponseEntity<Order>> updateOrderStatus(@PathVariable String id, @RequestParam Order.OrderStatus status) {
        return orderService.updateOrderStatus(id, status)
                .map(ResponseEntity::ok)
                .onErrorReturn(ResponseEntity.notFound().build());
    }

    @GetMapping("/node/{nodeId}")
    public Flux<Order> getOrdersByDealershipNode(@PathVariable String nodeId) {
        return orderService.getOrdersByDealershipNode(nodeId);
    }
}
