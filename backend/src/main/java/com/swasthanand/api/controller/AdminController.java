package com.swasthanand.api.controller;

import com.swasthanand.api.model.Order;
import com.swasthanand.api.model.User;
import com.swasthanand.api.repository.OrderRepository;
import com.swasthanand.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository,
            PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        return userRepository.findAll()
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    @PostMapping("/users")
    public Mono<ResponseEntity<Object>> createUser(@RequestBody Map<String, Object> body) {
        String phone = (String) body.get("phone");
        String name = (String) body.get("name");
        String password = (String) body.getOrDefault("password", "admin123");
        String roleStr = (String) body.getOrDefault("role", "CUSTOMER");

        return userRepository.findByPhone(phone)
                .flatMap(existing -> Mono.just(ResponseEntity.badRequest()
                        .body((Object) Map.of("message", "User with this phone number already exists."))))
                .switchIfEmpty(Mono.defer(() -> {
                    User user = User.builder()
                            .phone(phone)
                            .name(name)
                            .password(passwordEncoder.encode(password))
                            .role(User.Role.valueOf(roleStr.toUpperCase()))
                            .isApproved(true)
                            .addresses(new java.util.ArrayList<>())
                            .build();

                    if (body.containsKey("pincode") && body.get("pincode") != null
                            && !body.get("pincode").toString().isEmpty()) {
                        User.Address addr = User.Address.builder()
                                .pincode((String) body.get("pincode"))
                                .state((String) body.get("state"))
                                .district((String) body.get("district"))
                                .village((String) body.get("village"))
                                .landMark((String) body.get("landMark"))
                                .label("Office")
                                .isDefault(true)
                                .build();
                        user.getAddresses().add(addr);
                    }

                    user.serializeAddresses();
                    return userRepository.save(user)
                            .map(saved -> {
                                saved.deserializeAddresses();
                                return ResponseEntity.ok((Object) saved);
                            });
                }));
    }

    @PutMapping("/users/{id}")
    public Mono<ResponseEntity<Object>> updateUser(@PathVariable String id, @RequestBody Map<String, Object> body) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    user.deserializeAddresses();
                    if (body.containsKey("name")) {
                        user.setName((String) body.get("name"));
                    }
                    if (body.containsKey("phone")) {
                        user.setPhone((String) body.get("phone"));
                    }
                    if (body.containsKey("role")) {
                        user.setRole(User.Role.valueOf(((String) body.get("role")).toUpperCase()));
                    }
                    if (body.containsKey("password") && body.get("password") != null
                            && !body.get("password").toString().isBlank()) {
                        user.setPassword(passwordEncoder.encode((String) body.get("password")));
                    }
                    if (body.containsKey("pincode") && body.get("pincode") != null
                            && !body.get("pincode").toString().isEmpty()) {
                        User.Address addr = User.Address.builder()
                                .pincode((String) body.get("pincode"))
                                .state((String) body.get("state"))
                                .district((String) body.get("district"))
                                .village((String) body.get("village"))
                                .landMark((String) body.get("landMark"))
                                .label("Office")
                                .isDefault(true)
                                .build();
                        if (user.getAddresses() == null) {
                            user.setAddresses(new java.util.ArrayList<>());
                        }
                        user.getAddresses().clear();
                        user.getAddresses().add(addr);
                    }
                    user.serializeAddresses();
                    return userRepository.save(user)
                            .map(saved -> {
                                saved.deserializeAddresses();
                                return ResponseEntity.ok((Object) saved);
                            });
                })
                .defaultIfEmpty(ResponseEntity.<Object>notFound().build())
                .map(res -> (ResponseEntity<Object>) (ResponseEntity<?>) res);
    }

    @PutMapping("/users/{id}/approve")
    public Mono<ResponseEntity<Object>> approveUser(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    user.setIsApproved(true);
                    return userRepository.save(user)
                            .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "message", "User approved successfully.")));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/users/{id}")
    public Mono<ResponseEntity<Void>> deleteUser(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> userRepository.delete(user).then(Mono.just(ResponseEntity.ok().<Void>build())))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders")
    public Flux<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @PutMapping("/orders/{orderId}/status")
    public Mono<ResponseEntity<Order>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestBody Map<String, String> body) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(body.get("status").toUpperCase());
        return orderRepository.findById(orderId)
                .flatMap(order -> {
                    order.setStatus(status);
                    return orderRepository.save(order);
                })
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/orders/{orderId}")
    public Mono<ResponseEntity<Order>> updateOrder(
            @PathVariable String orderId,
            @RequestBody Map<String, Object> body) {

        return orderRepository.findById(orderId)
                .flatMap(order -> {
                    if (body.containsKey("totalAmount")) {
                        order.setTotalAmount(new java.math.BigDecimal(body.get("totalAmount").toString()));
                    }
                    if (body.containsKey("status")) {
                        order.setStatus(Order.OrderStatus.valueOf(body.get("status").toString().toUpperCase()));
                    }
                    if (body.containsKey("cancellationReason")) {
                        order.setCancellationReason((String) body.get("cancellationReason"));
                    }
                    return orderRepository.save(order);
                })
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/orders/{orderId}")
    public Mono<ResponseEntity<Void>> deleteOrder(@PathVariable String orderId) {
        return orderRepository.existsById(orderId)
                .flatMap(exists -> {
                    if (exists) {
                        return orderRepository.deleteById(orderId)
                                .then(Mono.just(ResponseEntity.noContent().<Void>build()));
                    } else {
                        return Mono.just(ResponseEntity.notFound().<Void>build());
                    }
                });
    }
}
