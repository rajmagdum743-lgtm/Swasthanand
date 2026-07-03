package com.swasthanand.api.controller;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.service.OrderService;
import com.swasthanand.api.repository.UserRepository;
import com.swasthanand.api.repository.DealershipNodeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.security.Principal;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final DealershipNodeRepository dealershipNodeRepository;

    private Mono<Boolean> hasAccessToNode(String nodeId, Principal principal) {
        if (principal == null) {
            return Mono.just(false);
        }
        String phone = principal.getName();
        return userRepository.findByPhone(phone)
                .flatMap(user -> {
                    if (user.getRole() == com.swasthanand.api.model.User.Role.ADMIN) {
                        return Mono.just(true); // Admins can access all nodes
                    }
                    if (user.getRole() == com.swasthanand.api.model.User.Role.DEALER) {
                        return dealershipNodeRepository.findByAssignedDealerId(user.getId())
                                .map(node -> node.getId().equals(nodeId))
                                .defaultIfEmpty(false);
                    }
                    return Mono.just(false); // Other roles have no access to dealer nodes
                })
                .defaultIfEmpty(false);
    }

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
    public Mono<ResponseEntity<Order>> updateOrderStatus(
            @PathVariable String id, 
            @RequestParam Order.OrderStatus status,
            Principal principal) {
        return orderService.getAllOrders()
                .filter(o -> o.getId().equals(id))
                .next()
                .flatMap(order -> hasAccessToNode(order.getDealershipNodeId(), principal)
                        .flatMap(hasAccess -> {
                            if (!hasAccess) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to update this order"));
                            }
                            return orderService.updateOrderStatus(id, status)
                                    .map(ResponseEntity::ok);
                        }))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/node/{nodeId}")
    public Flux<Order> getOrdersByDealershipNode(@PathVariable String nodeId, Principal principal) {
        return hasAccessToNode(nodeId, principal)
                .flatMapMany(hasAccess -> {
                    if (!hasAccess) {
                        return Flux.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied to this dealership node's orders"));
                    }
                    return orderService.getOrdersByDealershipNode(nodeId);
                });
    }
}
