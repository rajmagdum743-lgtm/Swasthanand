package com.swasthanand.api.service;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;

    public Mono<Order> createOrder(Order order) {
        order.setStatus(Order.OrderStatus.PENDING);
        order.setRazorpayOrderId("rzp_test_" + UUID.randomUUID().toString().substring(0, 8));
        return orderRepository.save(order);
    }

    public Flux<Order> getOrdersByUser(String userId) {
        return orderRepository.findByUserId(userId);
    }

    public Flux<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Flux<Order> getOrdersByDealershipNode(String dealershipNodeId) {
        return orderRepository.findByDealershipNodeId(dealershipNodeId);
    }

    public Mono<Order> updateOrderStatus(String orderId, Order.OrderStatus status) {
        return orderRepository.findById(orderId)
                .flatMap(order -> {
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Order not found: " + orderId)));
    }
}
