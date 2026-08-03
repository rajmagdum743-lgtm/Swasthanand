package com.swasthanand.api.service;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import com.swasthanand.api.repository.ProductRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import org.springframework.transaction.annotation.Transactional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductService productService;

    @Transactional
    public Mono<Order> createOrder(Order order) {
        if (order.getStatus() == null) {
            order.setStatus(Order.OrderStatus.PENDING);
        }
        if (order.getRazorpayOrderId() == null || order.getRazorpayOrderId().isBlank()) {
            order.setRazorpayOrderId("rzp_test_" + UUID.randomUUID().toString().substring(0, 8));
        }
        order.serializeItems();

        if (order.getItems() == null || order.getItems().isEmpty()) {
            return orderRepository.save(order);
        }

        return Flux.fromIterable(order.getItems())
                .flatMap(item -> productService.getProductById(item.getProductId())
                        .flatMap(product -> {
                            int availableStock = product.getStock() != null ? product.getStock() : 0;
                            if (availableStock <= 0 || availableStock < item.getQuantity() || product.getStatus() == com.swasthanand.api.model.Product.LifecycleState.SOLD) {
                                return Mono.error(new IllegalArgumentException("Product '" + product.getName() + "' is out of stock and cannot be ordered."));
                            }
                            int newStock = availableStock - item.getQuantity();
                            product.setStock(newStock);
                            if (newStock == 0) {
                                product.setStatus(com.swasthanand.api.model.Product.LifecycleState.SOLD);
                            }
                            return productService.saveProduct(product);
                        })
                        .switchIfEmpty(Mono.error(new IllegalArgumentException("Product not found: " + item.getProductId())))
                )
                .then(orderRepository.save(order));
    }

    public Mono<Order> getOrderById(String orderId) {
        return orderRepository.findById(orderId);
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
                    order.setNew(false);
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .switchIfEmpty(Mono.error(new IllegalArgumentException("Order not found: " + orderId)));
    }
}
