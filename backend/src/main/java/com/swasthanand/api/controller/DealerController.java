package com.swasthanand.api.controller;

import com.swasthanand.api.model.*;
import com.swasthanand.api.repository.*;
import com.swasthanand.api.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dealer")
@RequiredArgsConstructor
@PreAuthorize("hasRole('DEALER')")
@Tag(name = "Dealer Workflows", description = "Endpoints for Dealer stock adjustment, orders, and dashboard (FR 1 / Step 3)")
@Slf4j
public class DealerController {

    private final UserRepository userRepository;
    private final DealershipNodeRepository dealershipNodeRepository;
    private final ProductService productService;
    private final ProductRepository productRepository;
    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final CacheService cacheService;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final DealerAlertRepository dealerAlertRepository;
    private final DealerCertificationRepository dealerCertificationRepository;

    private Mono<DealershipNode> getAssignedNode(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> dealershipNodeRepository.findByAssignedDealerId(user.getId())
                        .switchIfEmpty(Mono.defer(() -> {
                            DealershipNode newNode = DealershipNode.builder()
                                    .id("node-dealer-" + user.getId())
                                    .name((user.getName() != null ? user.getName() : "Dealer") + " Warehouse Node")
                                    .latitude(17.6805)
                                    .longitude(73.9918)
                                    .geofenceRadiusKm(5.0)
                                    .assignedDealerId(user.getId())
                                    .build();
                            return dealershipNodeRepository.save(newNode);
                        }))
                )
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Dealer user not found")));
    }

    // --- Dealer Business Certifications Endpoints ---

    @GetMapping("/certifications")
    @Operation(summary = "Get all business certifications of logged-in dealer")
    public Flux<DealerCertification> getDealerCertifications(Principal principal) {
        if (principal == null) {
            return Flux.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMapMany(user -> dealerCertificationRepository.findByDealerIdOrderByCreatedAtDesc(user.getId()));
    }

    @PostMapping("/certifications")
    @Operation(summary = "Upload / Add a new business certification")
    public Mono<ResponseEntity<DealerCertification>> addDealerCertification(@RequestBody DealerCertification cert, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> {
                    cert.setDealerId(user.getId());
                    cert.setVerificationStatus("PENDING");
                    return dealerCertificationRepository.save(cert);
                })
                .map(ResponseEntity::ok);
    }

    @PutMapping("/certifications/{certId}")
    @Operation(summary = "Update / Replace a business certification")
    public Mono<ResponseEntity<DealerCertification>> updateDealerCertification(@PathVariable String certId, @RequestBody DealerCertification updated, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> dealerCertificationRepository.findById(certId)
                        .flatMap(cert -> {
                            if (!user.getId().equals(cert.getDealerId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Certification does not belong to you"));
                            }
                            if (updated.getCertType() != null) cert.setCertType(updated.getCertType());
                            if (updated.getTitle() != null) cert.setTitle(updated.getTitle());
                            if (updated.getCertNumber() != null) cert.setCertNumber(updated.getCertNumber());
                            if (updated.getFileUrl() != null) cert.setFileUrl(updated.getFileUrl());
                            if (updated.getFileName() != null) cert.setFileName(updated.getFileName());
                            if (updated.getIssueDate() != null) cert.setIssueDate(updated.getIssueDate());
                            if (updated.getExpiryDate() != null) cert.setExpiryDate(updated.getExpiryDate());
                            cert.setVerificationStatus("PENDING");
                            return dealerCertificationRepository.save(cert);
                        }))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/certifications/{certId}")
    @Operation(summary = "Delete a business certification")
    public Mono<ResponseEntity<Void>> deleteDealerCertification(@PathVariable String certId, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> dealerCertificationRepository.findById(certId)
                        .flatMap(cert -> {
                            if (!user.getId().equals(cert.getDealerId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Certification does not belong to you"));
                            }
                            return dealerCertificationRepository.delete(cert).then(Mono.just(ResponseEntity.ok().<Void>build()));
                        }))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    // --- Product Traceability Update Endpoint ---

    @PutMapping("/products/{productId}/traceability")
    @Operation(summary = "Edit product traceability information for dealer-owned product")
    public Mono<ResponseEntity<Product>> updateProductTraceability(@PathVariable String productId, @RequestBody Map<String, String> body, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return getAssignedNode(principal)
                .flatMap(node -> productRepository.findById(productId)
                        .flatMap(product -> {
                            if (product.getDealershipNodeId() != null && !product.getDealershipNodeId().equals(node.getId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "You do not own this product"));
                            }
                            if (body.containsKey("batchId")) product.setBatchId(body.get("batchId"));
                            if (body.containsKey("harvestDate")) product.setHarvestDate(body.get("harvestDate"));
                            if (body.containsKey("mfgDate")) product.setMfgDate(body.get("mfgDate"));
                            if (body.containsKey("processingDetails")) product.setProcessingDetails(body.get("processingDetails"));
                            if (body.containsKey("storageDetails")) product.setStorageDetails(body.get("storageDetails"));
                            if (body.containsKey("transportDetails")) product.setTransportDetails(body.get("transportDetails"));
                            if (body.containsKey("origin")) product.setOrigin(body.get("origin"));
                            if (body.containsKey("growthQuality")) product.setGrowthQuality(body.get("growthQuality"));
                            if (body.containsKey("qualityInfo")) product.setQualityInfo(body.get("qualityInfo"));
                            if (body.containsKey("certificateUrl")) product.setCertificateUrl(body.get("certificateUrl"));
                            if (body.containsKey("expiryDate") && body.get("expiryDate") != null && !body.get("expiryDate").isBlank()) {
                                try {
                                    product.setExpiryDate(java.time.LocalDate.parse(body.get("expiryDate")));
                                } catch (Exception e) {}
                            }

                            return productRepository.save(product);
                        }))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/alerts")
    @Operation(summary = "Get alerts sent to the dealer by Admin")
    public Flux<DealerAlert> getDealerAlerts(Principal principal) {
        if (principal == null) {
            return Flux.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMapMany(user -> dealerAlertRepository.findByDealerIdOrderByCreatedAtDesc(user.getId()));
    }

    @PutMapping("/alerts/{alertId}/read")
    @Operation(summary = "Mark a dealer alert as read")
    public Mono<ResponseEntity<DealerAlert>> markAlertAsRead(@PathVariable String alertId, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> dealerAlertRepository.findById(alertId)
                        .flatMap(alert -> {
                            if (!user.getId().equals(alert.getDealerId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Alert does not belong to you"));
                            }
                            alert.setIsRead(true);
                            return dealerAlertRepository.save(alert);
                        }))
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/alerts/{alertId}")
    @Operation(summary = "Delete a dealer alert")
    public Mono<ResponseEntity<Void>> deleteDealerAlert(@PathVariable String alertId, Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> dealerAlertRepository.findById(alertId)
                        .flatMap(alert -> {
                            if (!user.getId().equals(alert.getDealerId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Alert does not belong to you"));
                            }
                            return dealerAlertRepository.delete(alert).then(Mono.just(ResponseEntity.ok().<Void>build()));
                        }))
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/profile")
    @Operation(summary = "Get full profile of logged-in dealer")
    public Mono<ResponseEntity<Map<String, Object>>> getDealerProfile(Principal principal) {
        if (principal == null) {
            return Mono.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMap(user -> {
                    user.deserializeAddresses();
                    return dealershipNodeRepository.findByAssignedDealerId(user.getId())
                            .map(node -> (Object) node)
                            .defaultIfEmpty(Map.of())
                            .map(nodeObj -> {
                                Map<String, Object> response = new HashMap<>();
                                response.put("id", user.getId());
                                response.put("name", user.getName());
                                response.put("phone", user.getPhone());
                                response.put("role", user.getRole());
                                response.put("isApproved", user.getIsApproved());
                                response.put("status", user.getStatus());
                                response.put("addresses", user.getAddresses());
                                if (nodeObj instanceof DealershipNode node) {
                                    response.put("dealershipNode", node);
                                } else {
                                    response.put("dealershipNode", null);
                                }
                                return ResponseEntity.ok(response);
                            });
                })
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dealer dashboard metrics")
    public Mono<ResponseEntity<Map<String, Object>>> getDashboard(Principal principal) {
        String cacheKey = "dealer::dashboard::" + principal.getName();
        return cacheService.get(cacheKey)
                .map(cached -> ResponseEntity.ok((Map<String, Object>) cached))
                .switchIfEmpty(
                    userRepository.findByPhone(principal.getName())
                        .flatMap(user -> getAssignedNode(principal)
                            .flatMap(node -> {
                                Mono<Long> totalProducts = productRepository.findByDealerIdOrDealershipNodeId(user.getId(), node.getId()).count();
                                Mono<Long> lowStockProducts = productRepository.findLowStockProducts(10)
                                        .filter(p -> user.getId().equals(p.getDealerId()) || node.getId().equals(p.getDealershipNodeId()))
                                        .count();
                                Mono<Long> pendingOrders = orderRepository.findByDealershipNodeId(node.getId())
                                        .filter(o -> o.getStatus() == Order.OrderStatus.PENDING)
                                        .count();
                                Mono<Long> completedOrders = orderRepository.findByDealershipNodeId(node.getId())
                                        .filter(o -> o.getStatus() == Order.OrderStatus.DELIVERED)
                                        .count();

                                return Mono.zip(totalProducts, lowStockProducts, pendingOrders, completedOrders)
                                        .map(tuple -> {
                                            Map<String, Object> data = Map.of(
                                                    "dealershipNode", node,
                                                    "totalProductsCount", tuple.getT1(),
                                                    "lowStockCount", tuple.getT2(),
                                                    "pendingOrdersCount", tuple.getT3(),
                                                    "completedOrdersCount", tuple.getT4()
                                            );
                                            return data;
                                        })
                                        .flatMap(data -> cacheService.put(cacheKey, data, 10).thenReturn(data));
                            })
                        )
                        .map(ResponseEntity::ok)
                );
    }

    @GetMapping("/inventory")
    @Operation(summary = "Get products allocated to the logged-in dealer")
    public Flux<Product> getInventory(Principal principal) {
        if (principal == null) {
            return Flux.error(new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        }
        return userRepository.findByPhone(principal.getName())
                .flatMapMany(user -> getAssignedNode(principal)
                        .flatMapMany(node -> productRepository.findByDealerIdOrDealershipNodeId(user.getId(), node.getId()))
                )
                .map(p -> {
                    p.deserializeTags();
                    return p;
                });
    }

    @PostMapping("/inventory/{productId}/adjust")
    @Operation(summary = "Adjust local stock level (FR 1: Stock Adjustment)")
    public Mono<ResponseEntity<Product>> adjustStock(
            @PathVariable String productId,
            @RequestBody Map<String, Object> body,
            Principal principal) {

        int quantity = Integer.parseInt(body.get("quantity").toString());
        String action = (String) body.get("action"); // "INCREMENT" or "DECREMENT"
        String reason = (String) body.getOrDefault("reason", "Dealer Stock Adjustment");

        return getAssignedNode(principal)
                .flatMap(node -> productRepository.findById(productId)
                        .flatMap(product -> {
                            if (!node.getId().equals(product.getDealershipNodeId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Product is not allocated to your dealership node"));
                            }
                            
                            Mono<Product> adjustMono;
                            if ("INCREMENT".equalsIgnoreCase(action)) {
                                adjustMono = productService.incrementStock(productId, quantity, principal.getName(), reason);
                            } else if ("DECREMENT".equalsIgnoreCase(action)) {
                                adjustMono = productService.decrementStock(productId, quantity, principal.getName(), reason);
                            } else {
                                return Mono.error(new IllegalArgumentException("Invalid action: " + action));
                            }
                            
                            return adjustMono
                                    .flatMap(updated -> cacheService.invalidateDealerDashboard(principal.getName())
                                            .then(cacheService.invalidateInventorySummary(node.getId()))
                                            .thenReturn(updated));
                        })
                )
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }

    @GetMapping("/orders")
    @Operation(summary = "Get orders assigned to the dealer's node")
    public Flux<Order> getOrders(Principal principal) {
        return getAssignedNode(principal)
                .flatMapMany(node -> orderRepository.findByDealershipNodeId(node.getId()))
                .map(o -> {
                    o.deserializeItems();
                    return o;
                });
    }

    @PutMapping("/orders/{orderId}/status")
    @Operation(summary = "Update fulfillment stage of an assigned order")
    public Mono<ResponseEntity<Order>> updateOrderStatus(
            @PathVariable String orderId,
            @RequestParam Order.OrderStatus status,
            Principal principal) {

        return getAssignedNode(principal)
                .flatMap(node -> orderRepository.findById(orderId)
                        .flatMap(order -> {
                            if (!node.getId().equals(order.getDealershipNodeId())) {
                                return Mono.error(new ResponseStatusException(HttpStatus.FORBIDDEN, "Order is not assigned to your dealership node"));
                            }
                            
                            return orderService.updateOrderStatus(orderId, status)
                                    .flatMap(updated -> {
                                        if (status == Order.OrderStatus.DELIVERED) {
                                            eventPublisher.publishEvent(
                                                    new com.swasthanand.api.event.OrderCompletedEvent(this, orderId, node.getId())
                                            );
                                        }
                                        return cacheService.invalidateDealerDashboard(principal.getName()).thenReturn(updated);
                                    });
                        })
                )
                .map(ResponseEntity::ok)
                .defaultIfEmpty(ResponseEntity.notFound().build());
    }
}
