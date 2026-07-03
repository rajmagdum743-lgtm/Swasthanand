package com.swasthanand.api.service;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import com.swasthanand.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;

    public Mono<Order> createOrder(Order order) {
        order.setStatus(Order.OrderStatus.PENDING);
        order.setRazorpayOrderId("rzp_test_" + UUID.randomUUID().toString().substring(0, 8));
        order.serializeItems();

        if (order.getItems() == null || order.getItems().isEmpty()) {
            return orderRepository.save(order);
        }

        return Flux.fromIterable(order.getItems())
                .flatMap(item -> productRepository.findById(item.getProductId())
                        .flatMap(product -> {
                            if (product.getStock() < item.getQuantity()) {
                                return Mono.error(new IllegalArgumentException("Insufficient stock for product: " + product.getName()));
                            }
                            product.setStock(product.getStock() - item.getQuantity());
                            return productRepository.save(product);
                        })
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found: " + item.getProductId())))
                )
                .then(orderRepository.save(order));
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
