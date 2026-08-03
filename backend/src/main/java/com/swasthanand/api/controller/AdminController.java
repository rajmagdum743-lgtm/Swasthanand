package com.swasthanand.api.controller;

import com.swasthanand.api.model.DealerAlert;
import com.swasthanand.api.model.DealershipNode;
import com.swasthanand.api.model.Order;
import com.swasthanand.api.model.User;
import com.swasthanand.api.repository.DealerAlertRepository;
import com.swasthanand.api.repository.DealershipNodeRepository;
import com.swasthanand.api.repository.OrderRepository;
import com.swasthanand.api.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;
import com.swasthanand.api.model.DealerCertification;
import com.swasthanand.api.repository.DealerCertificationRepository;
import reactor.core.publisher.Mono;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final PasswordEncoder passwordEncoder;
    private final DealershipNodeRepository dealershipNodeRepository;
    private final DealerAlertRepository dealerAlertRepository;
    private final DealerCertificationRepository dealerCertificationRepository;

    public AdminController(UserRepository userRepository, OrderRepository orderRepository,
            PasswordEncoder passwordEncoder, DealershipNodeRepository dealershipNodeRepository,
            DealerAlertRepository dealerAlertRepository,
            DealerCertificationRepository dealerCertificationRepository) {
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.passwordEncoder = passwordEncoder;
        this.dealershipNodeRepository = dealershipNodeRepository;
        this.dealerAlertRepository = dealerAlertRepository;
        this.dealerCertificationRepository = dealerCertificationRepository;
    }

    @GetMapping("/dealers/{dealerId}/certifications")
    public Flux<DealerCertification> getDealerCertificationsAdmin(@PathVariable String dealerId) {
        return dealerCertificationRepository.findByDealerIdOrderByCreatedAtDesc(dealerId);
    }

    @PutMapping("/certifications/{certId}/status")
    public Mono<ResponseEntity<Object>> updateCertificationStatus(
            @PathVariable String certId,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "VERIFIED").toUpperCase();
        return dealerCertificationRepository.findById(certId)
                .flatMap(cert -> {
                    cert.setVerificationStatus(status);
                    return dealerCertificationRepository.save(cert);
                })
                .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "certification", saved)))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PostMapping("/dealers/{dealerId}/alerts")
    public Mono<ResponseEntity<Object>> sendDealerAlert(
            @PathVariable String dealerId,
            @RequestBody Map<String, String> body) {
        
        String subject = body.get("subject");
        String message = body.get("message");
        String messageType = body.getOrDefault("messageType", "INFORMATION").toUpperCase();

        if (subject == null || subject.isBlank() || message == null || message.isBlank()) {
            return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "Subject and message are required.")));
        }

        return userRepository.findById(dealerId)
                .flatMap(user -> {
                    if (user.getRole() != User.Role.DEALER) {
                        return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "User is not a dealer.")));
                    }

                    DealerAlert alert = DealerAlert.builder()
                            .dealerId(dealerId)
                            .subject(subject)
                            .message(message)
                            .messageType(messageType)
                            .isRead(false)
                            .build();

                    return dealerAlertRepository.save(alert)
                            .map(saved -> ResponseEntity.ok((Object) Map.of(
                                    "success", true,
                                    "message", "Alert dispatched to dealer successfully.",
                                    "alert", saved
                            )));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        return userRepository.findAll()
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    @GetMapping("/dealers")
    public Flux<Map<String, Object>> getAllDealers() {
        return userRepository.findAll()
                .filter(u -> u.getRole() == User.Role.DEALER)
                .flatMap(dealer -> {
                    dealer.deserializeAddresses();
                    return dealershipNodeRepository.findByAssignedDealerId(dealer.getId())
                            .map(node -> (Object) node)
                            .defaultIfEmpty(Map.of())
                            .map(nodeObj -> {
                                Map<String, Object> map = new HashMap<>();
                                map.put("id", dealer.getId());
                                map.put("name", dealer.getName());
                                map.put("phone", dealer.getPhone());
                                map.put("role", dealer.getRole());
                                map.put("isApproved", dealer.getIsApproved());
                                map.put("status", dealer.getStatus());
                                map.put("addresses", dealer.getAddresses());
                                if (nodeObj instanceof DealershipNode node) {
                                    map.put("dealershipNode", node);
                                } else {
                                    map.put("dealershipNode", null);
                                }
                                return map;
                            });
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
                    user.setStatus(User.UserStatus.ACTIVE);
                    return userRepository.save(user)
                            .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "message", "User approved successfully.")));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/dealers/{id}/approve")
    public Mono<ResponseEntity<Object>> approveDealer(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    if (user.getRole() != User.Role.DEALER) {
                        return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "User is not a dealer")));
                    }
                    user.setIsApproved(true);
                    user.setStatus(User.UserStatus.ACTIVE);
                    return userRepository.save(user)
                            .flatMap(savedUser -> dealershipNodeRepository.findByAssignedDealerId(savedUser.getId())
                                    .switchIfEmpty(Mono.defer(() -> {
                                        DealershipNode node = DealershipNode.builder()
                                                .id("node-dealer-" + savedUser.getId())
                                                .name((savedUser.getName() != null ? savedUser.getName() : "Dealer") + " Warehouse Node")
                                                .latitude(17.6805)
                                                .longitude(73.9918)
                                                .geofenceRadiusKm(5.0)
                                                .assignedDealerId(savedUser.getId())
                                                .build();
                                        return dealershipNodeRepository.save(node);
                                    }))
                                    .thenReturn(ResponseEntity.ok((Object) Map.of("success", true, "message", "Dealer approved successfully."))));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/dealers/{id}/reject")
    public Mono<ResponseEntity<Object>> rejectDealer(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    if (user.getRole() != User.Role.DEALER) {
                        return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "User is not a dealer")));
                    }
                    user.setIsApproved(false);
                    user.setStatus(User.UserStatus.REJECTED);
                    return userRepository.save(user)
                            .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "message", "Dealer registration rejected.")));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/dealers/{id}/activate")
    public Mono<ResponseEntity<Object>> activateDealer(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    if (user.getRole() != User.Role.DEALER) {
                        return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "User is not a dealer")));
                    }
                    user.setIsApproved(true);
                    user.setStatus(User.UserStatus.ACTIVE);
                    return userRepository.save(user)
                            .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "message", "Dealer activated successfully.")));
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @PutMapping("/dealers/{id}/suspend")
    public Mono<ResponseEntity<Object>> suspendDealer(@PathVariable String id) {
        return userRepository.findById(id)
                .flatMap(user -> {
                    if (user.getRole() != User.Role.DEALER) {
                        return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "User is not a dealer")));
                    }
                    user.setStatus(User.UserStatus.SUSPENDED);
                    return userRepository.save(user)
                            .map(saved -> ResponseEntity.ok((Object) Map.of("success", true, "message", "Dealer suspended successfully.")));
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
                    order.setNew(false);
                    order.setStatus(status);
                    if (body.containsKey("reason") && body.get("reason") != null) {
                        order.setCancellationReason(body.get("reason"));
                    }
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
                    order.setNew(false);
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
