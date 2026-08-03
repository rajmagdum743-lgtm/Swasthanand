package com.swasthanand.api.service;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.OrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.math.BigDecimal;
import java.util.List;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductService productService;

    private OrderService orderService;
    private Order sampleOrder;
    private Product sampleProduct;

    @BeforeEach
    public void setUp() {
        orderService = new OrderService(orderRepository, productService);
        
        Order.OrderItem item = new Order.OrderItem("prod-123", 2, new BigDecimal("100"));
        sampleOrder = Order.builder()
                .id("ord-123")
                .userId("user-123")
                .totalAmount(new BigDecimal("200"))
                .items(List.of(item))
                .dealershipNodeId("node-123")
                .build();
        
        sampleProduct = Product.builder()
                .id("prod-123")
                .name("Test Product")
                .stock(10)
                .status(Product.LifecycleState.QC_PASSED)
                .build();

        lenient().when(orderRepository.save(any(Order.class))).thenReturn(Mono.just(sampleOrder));
    }

    @Test
    public void testCreateOrder_Success() {
        when(productService.getProductById("prod-123")).thenReturn(Mono.just(sampleProduct));
        when(productService.saveProduct(any(Product.class))).thenReturn(Mono.just(sampleProduct));
        when(orderRepository.save(any(Order.class))).thenReturn(Mono.just(sampleOrder));

        StepVerifier.create(orderService.createOrder(sampleOrder))
                .expectNextMatches(o -> o.getId().equals("ord-123"))
                .verifyComplete();
    }

    @Test
    public void testCreateOrder_InsufficientStock() {
        sampleProduct.setStock(1);
        when(productService.getProductById("prod-123")).thenReturn(Mono.just(sampleProduct));

        StepVerifier.create(orderService.createOrder(sampleOrder))
                .expectError(IllegalArgumentException.class)
                .verify();
    }

    @Test
    public void testGetOrderById() {
        when(orderRepository.findById("ord-123")).thenReturn(Mono.just(sampleOrder));

        StepVerifier.create(orderService.getOrderById("ord-123"))
                .expectNextMatches(o -> o.getUserId().equals("user-123"))
                .verifyComplete();
    }

    @Test
    public void testUpdateOrderStatus() {
        when(orderRepository.findById("ord-123")).thenReturn(Mono.just(sampleOrder));
        when(orderRepository.save(any(Order.class))).thenReturn(Mono.just(sampleOrder));

        StepVerifier.create(orderService.updateOrderStatus("ord-123", Order.OrderStatus.CONFIRMED))
                .expectNextMatches(o -> o.getStatus() == Order.OrderStatus.CONFIRMED)
                .verifyComplete();
    }
}
