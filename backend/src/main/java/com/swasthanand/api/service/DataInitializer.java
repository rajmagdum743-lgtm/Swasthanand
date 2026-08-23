package com.swasthanand.api.service;

import com.swasthanand.api.model.*;
import com.swasthanand.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserService userService;
    private final FarmBatchRepository farmBatchRepository;
    private final PasswordEncoder passwordEncoder;
    private final DealershipNodeRepository dealershipNodeRepository;
    private final OrderRepository orderRepository;
    private final BatchRepository batchRepository;

    @Value("${app.demo-data.enabled:false}")
    private boolean demoDataEnabled;

    @Value("${app.demo-data.admin-password:}")
    private String demoAdminPassword;

    @Value("${app.demo-data.dealer-password:}")
    private String demoDealerPassword;

    @Override
    public void run(String... args) throws Exception {
        if (!demoDataEnabled) {
            log.info("Demo data seeding is disabled (app.demo-data.enabled=false). Startup complete.");
            return;
        }

        log.info("Initializing Swasthanand Demo Data...");
        
        initializeAdmin()
            .then(initializeDealer())
            .then(initializeSampleBatchAndProducts())
            .then(initializeSampleOrders())
            .then(initializeSampleBatches())
            .doOnError(err -> log.error("Error during demo data initialization: ", err))
            .doOnSuccess(v -> log.info("Swasthanand Demo Data Initialized Successfully."))
            .subscribe();
    }

    private Mono<Void> initializeAdmin() {
        String adminPhone = "9999999999";
        String encodedPassword = (demoAdminPassword != null && !demoAdminPassword.isBlank()) 
                ? passwordEncoder.encode(demoAdminPassword) 
                : null;

        return userService.findByPhone(adminPhone)
            .flatMap(existingAdmin -> {
                if (encodedPassword != null) {
                    existingAdmin.setPassword(encodedPassword);
                }
                existingAdmin.setRole(User.Role.ADMIN);
                existingAdmin.setIsApproved(true);
                existingAdmin.setStatus(User.UserStatus.ACTIVE);
                return userService.updateUser(existingAdmin);
            })
            .switchIfEmpty(Mono.defer(() -> {
                User admin = User.builder()
                        .phone(adminPhone)
                        .password(encodedPassword != null ? encodedPassword : "")
                        .name("Swasthanand Admin")
                        .role(User.Role.ADMIN)
                        .isApproved(true)
                        .status(User.UserStatus.ACTIVE)
                        .addresses(new ArrayList<>())
                        .build();
                return userService.registerUser(admin);
            }))
            .then();
    }

    private Mono<Void> initializeDealer() {
        String dealerPhone = "9284939947";
        String encodedPassword = (demoDealerPassword != null && !demoDealerPassword.isBlank()) 
                ? passwordEncoder.encode(demoDealerPassword) 
                : null;

        return userService.findByPhone(dealerPhone)
            .flatMap(existingDealer -> {
                existingDealer.setName("Swasthanand Dealer");
                if (encodedPassword != null) {
                    existingDealer.setPassword(encodedPassword);
                }
                existingDealer.setRole(User.Role.DEALER);
                existingDealer.setIsApproved(true);
                existingDealer.setStatus(User.UserStatus.ACTIVE);
                return userService.updateUser(existingDealer);
            })
            .switchIfEmpty(Mono.defer(() -> {
                User dealer = User.builder()
                        .phone(dealerPhone)
                        .password(encodedPassword != null ? encodedPassword : "")
                        .name("Swasthanand Dealer")
                        .role(User.Role.DEALER)
                        .isApproved(true)
                        .status(User.UserStatus.ACTIVE)
                        .addresses(new ArrayList<>())
                        .build();
                return userService.registerUser(dealer);
            }))
            .flatMap(dealer -> {
                return dealershipNodeRepository.findByAssignedDealerId(dealer.getId())
                    .switchIfEmpty(Mono.defer(() -> {
                        DealershipNode node = DealershipNode.builder()
                            .id("satara-coop-node-id")
                            .name("Satara Agri-Coop Center")
                            .latitude(17.6805)
                            .longitude(73.9918)
                            .geofenceRadiusKm(5.0)
                            .assignedDealerId(dealer.getId())
                            .build();
                        return dealershipNodeRepository.save(node);
                    }))
                    .then();
            });
    }

    private Mono<Void> initializeSampleBatchAndProducts() {
        return farmBatchRepository.count()
            .flatMap(count -> {
                if (count == 0) {
                    FarmBatch batch = FarmBatch.builder()
                        .harvestDate(LocalDate.now().minusDays(10))
                        .locationCoordinates("18.5204, 73.8567")
                        .region("Sangli District, Maharashtra")
                        .soilTestUrl("https://example.com/reports/soil-001.pdf")
                        .weatherSnapshot("Cloudy with moderate humidity. Avg Temp: 28°C")
                        .build();
                    return farmBatchRepository.save(batch);
                } else {
                    return farmBatchRepository.findAll().next();
                }
            })
            .flatMap(batch -> {
                return userService.findByPhone("9284939947")
                    .flatMap(dealer -> {
                        String dId = dealer != null ? dealer.getId() : null;
                        Mono<Void> p1 = initializeProduct("Organic Turmeric Finger", 
                            "Premium organic turmeric fingers sourced from Sangli.",
                            "Behold Haridra, the golden healer of the ancient texts. Its potent Ushna (heating) properties accelerate the Medo-Dhatu (fat) metabolism, while its Lekhana (scraping) action purifies the channels. For one seeking strength and weight correction, this is the sovereign remedy provided by Mother Earth herself.",
                            new BigDecimal("299.00"),
                            "Spices",
                            Arrays.asList("weight-loss", "immunity", "inflammation"),
                            batch.getId(),
                            "satara-coop-node-id",
                            dId);

                        Mono<Void> p2 = initializeProduct("Pure A2 Vedic Ghee", 
                            "Hand-churned A2 ghee from grass-fed Desi cows.",
                            "Samskara Ghee is the very essence of Agni. Contrary to common misunderstanding, pure A2 Ghee acts as a lubrication for the intestines, enhancing the 'Ojas' and stimulating the digestive fire. It assists in the healthy assimilation of nutrients while gently flushing out toxins.",
                            new BigDecimal("850.00"),
                            "Dairy",
                            Arrays.asList("weight-loss", "digestion", "skin", "energy"),
                            batch.getId(),
                            "satara-coop-node-id",
                            dId);

                        Mono<Void> p3 = initializeProduct("Moringa Powder (Shigru)", 
                            "Organic moringa leaf powder rich in nutrients.",
                            "Shigru, the 'Miracle Tree', is a powerhouse of Prana. Its bitter and pungent taste pacifies Kapha and Vata alike. It provides deep nourishment to the tissues while ensuring the lightness of the body. For those battling fatigue, Moringa serves as the sharp arrow that clears the fog.",
                            new BigDecimal("199.00"),
                            "Supplements",
                            Arrays.asList("immunity", "joint-pain", "weight-loss", "energy"),
                            batch.getId(),
                            "satara-coop-node-id",
                            dId);

                        return Mono.when(p1, p2, p3);
                    });
            });
    }

    private Mono<Void> initializeProduct(String name, String desc, String benefit, BigDecimal price, String category, List<String> tags, String batchId, String nodeId, String dealerId) {
        return productRepository.findByNameContainingIgnoreCase(name)
            .collectList()
            .flatMap(existingList -> {
                if (existingList.isEmpty()) {
                    Product product = Product.builder()
                        .name(name)
                        .description(desc)
                        .benefitsDescription(benefit)
                        .price(price)
                        .category(category)
                        .tags(new ArrayList<>(tags))
                        .origin("Maharashtra, India")
                        .batchId(batchId)
                        .harvestDate(LocalDate.now().minusDays(10).toString())
                        .weatherTemp("28°C")
                        .growthQuality("Excellent")
                        .organicMatter("4.2%")
                        .nitrogen("1.8%")
                        .zeroPesticides("Verified")
                        .image("/images/products/" + name.toLowerCase().replace(" ", "-").replace("(", "").replace(")", "") + ".jpg")
                        .stock(100)
                        .status(Product.LifecycleState.QC_PASSED)
                        .dealershipNodeId(nodeId)
                        .dealerId(dealerId)
                        .isApproved(true)
                        .build();
                    product.serializeTags();
                    return productRepository.save(product).then();
                } else {
                    Product existing = existingList.get(0);
                    existing.deserializeTags();
                    existing.setBenefitsDescription(benefit);
                    existing.setTags(new ArrayList<>(tags));
                    existing.setBatchId(batchId);
                    existing.setDealershipNodeId(nodeId);
                    if (dealerId != null) {
                        existing.setDealerId(dealerId);
                    }
                    if (existing.getStock() == null) {
                        existing.setStock(100);
                    }
                    existing.setIsApproved(true);
                    existing.serializeTags();
                    return productRepository.save(existing).then();
                }
            });
    }

    private Mono<Void> initializeSampleOrders() {
        return Mono.when(
            saveOrderIfMissing("B2B-ORD-5819", "dealer-id", new BigDecimal("18450.00"), Order.OrderStatus.CONFIRMED, "satara-coop-node-id"),
            saveOrderIfMissing("B2B-ORD-4720", "dealer-id", new BigDecimal("8900.00"), Order.OrderStatus.PENDING, "satara-coop-node-id"),
            saveOrderIfMissing("B2B-ORD-2038", "dealer-id", new BigDecimal("32400.00"), Order.OrderStatus.TRANSIT, "satara-coop-node-id"),
            saveOrderIfMissing("B2B-ORD-1192", "dealer-id", new BigDecimal("51200.00"), Order.OrderStatus.DELIVERED, "satara-coop-node-id")
        ).then();
    }

    private Mono<Void> saveOrderIfMissing(String id, String userId, BigDecimal amount, Order.OrderStatus status, String nodeId) {
        return orderRepository.findById(id)
            .switchIfEmpty(Mono.defer(() -> {
                Order order = Order.builder()
                    .id(id)
                    .userId(userId)
                    .totalAmount(amount)
                    .status(status)
                    .dealershipNodeId(nodeId)
                    .build();
                order.setNew(true);
                return orderRepository.save(order);
            }))
            .then();
    }

    private Mono<Void> initializeSampleBatches() {
        return batchRepository.count()
            .flatMap(count -> {
                if (count == 0) {
                    Batch b1 = Batch.builder()
                        .id("batch-turmeric-01")
                        .sku("TURM-FING-01")
                        .manufacturingDate(LocalDate.now().minusDays(15))
                        .expiryDate(LocalDate.now().plusMonths(12))
                        .qcStatus(Batch.QCStatus.PASSED)
                        .currentState(Product.LifecycleState.QC_PASSED)
                        .dealerAllocation("satara-coop-node-id")
                        .warehouse("Main Warehouse Pune")
                        .inventory(100)
                        .build();

                    Batch b2 = Batch.builder()
                        .id("batch-ghee-01")
                        .sku("GHEE-VEDIC-02")
                        .manufacturingDate(LocalDate.now().minusDays(20))
                        .expiryDate(LocalDate.now().plusMonths(6))
                        .qcStatus(Batch.QCStatus.PASSED)
                        .currentState(Product.LifecycleState.DEALER_ALLOCATED)
                        .dealerAllocation("satara-coop-node-id")
                        .warehouse("Main Warehouse Pune")
                        .inventory(150)
                        .build();

                    return batchRepository.save(b1)
                            .then(batchRepository.save(b2))
                            .then();
                }
                return Mono.empty();
            })
            .then();
    }
}
