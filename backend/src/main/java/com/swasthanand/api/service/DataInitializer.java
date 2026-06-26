package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.model.User;
import com.swasthanand.api.model.FarmBatch;
import com.swasthanand.api.repository.ProductRepository;
import com.swasthanand.api.repository.FarmBatchRepository;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final ProductRepository productRepository;
    private final UserService userService;
    private final FarmBatchRepository farmBatchRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("Initializing Swasthanand Product Data...");
        
        initializeAdmin()
            .then(initializeDealer())
            .then(initializeAshishPassword())
            .then(initializeSampleBatchAndProducts())
            .doOnError(err -> log.error("Error during data initialization: ", err))
            .doOnSuccess(v -> log.info("Swasthanand Data Initialized Successfully."))
            .subscribe();
    }

    private Mono<Void> initializeAdmin() {
        String adminPhone = "92849939947";
        return userService.findByPhone(adminPhone)
            .flatMap(existingAdmin -> {
                existingAdmin.setPassword(passwordEncoder.encode("admin123"));
                existingAdmin.setRole(User.Role.ADMIN);
                return userService.updateUser(existingAdmin);
            })
            .switchIfEmpty(Mono.defer(() -> {
                User admin = User.builder()
                        .phone(adminPhone)
                        .password(passwordEncoder.encode("admin123"))
                        .name("Swasthanand Admin")
                        .role(User.Role.ADMIN)
                        .addresses(new ArrayList<>())
                        .build();
                return userService.registerUser(admin);
            }))
            .then();
    }

    private Mono<Void> initializeDealer() {
        String dealerPhone = "9284939947";
        return userService.findByPhone(dealerPhone)
            .flatMap(existingDealer -> {
                existingDealer.setPassword(passwordEncoder.encode("admin123"));
                existingDealer.setRole(User.Role.DEALER);
                return userService.updateUser(existingDealer);
            })
            .switchIfEmpty(Mono.defer(() -> {
                User dealer = User.builder()
                        .phone(dealerPhone)
                        .password(passwordEncoder.encode("admin123"))
                        .name("Swasthanand Dealer")
                        .role(User.Role.DEALER)
                        .addresses(new ArrayList<>())
                        .build();
                return userService.registerUser(dealer);
            }))
            .then();
    }

    private Mono<Void> initializeAshishPassword() {
        return userService.findByPhone("9876543210")
            .flatMap(user -> {
                user.setPassword(passwordEncoder.encode("Ashish123"));
                return userService.updateUser(user).then();
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
                Mono<Void> p1 = initializeProduct("Organic Turmeric Finger", 
                    "Premium organic turmeric fingers sourced from Sangli.",
                    "Behold Haridra, the golden healer of the ancient texts. Its potent Ushna (heating) properties accelerate the Medo-Dhatu (fat) metabolism, while its Lekhana (scraping) action purifies the channels. For one seeking strength and weight correction, this is the sovereign remedy provided by Mother Earth herself.",
                    new BigDecimal("299.00"),
                    "Spices",
                    Arrays.asList("weight-loss", "immunity", "inflammation"),
                    batch.getId());

                Mono<Void> p2 = initializeProduct("Pure A2 Vedic Ghee", 
                    "Hand-churned A2 ghee from grass-fed Desi cows.",
                    "Samskara Ghee is the very essence of Agni. Contrary to common misunderstanding, pure A2 Ghee acts as a lubrication for the intestines, enhancing the 'Ojas' and stimulating the digestive fire. It assists in the healthy assimilation of nutrients while gently flushing out toxins.",
                    new BigDecimal("850.00"),
                    "Dairy",
                    Arrays.asList("weight-loss", "digestion", "skin", "energy"),
                    batch.getId());

                Mono<Void> p3 = initializeProduct("Moringa Powder (Shigru)", 
                    "Organic moringa leaf powder rich in nutrients.",
                    "Shigru, the 'Miracle Tree', is a powerhouse of Prana. Its bitter and pungent taste pacifies Kapha and Vata alike. It provides deep nourishment to the tissues while ensuring the lightness of the body. For those battling fatigue, Moringa serves as the sharp arrow that clears the fog.",
                    new BigDecimal("199.00"),
                    "Supplements",
                    Arrays.asList("immunity", "joint-pain", "weight-loss", "energy"),
                    batch.getId());

                return Mono.when(p1, p2, p3);
            });
    }

    private Mono<Void> initializeProduct(String name, String desc, String benefit, BigDecimal price, String category, List<String> tags, String batchId) {
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
                        .build();
                    product.serializeTags();
                    return productRepository.save(product).then();
                } else {
                    Product existing = existingList.get(0);
                    existing.deserializeTags();
                    existing.setBenefitsDescription(benefit);
                    existing.setTags(new ArrayList<>(tags));
                    existing.setBatchId(batchId);
                    if (existing.getStock() == null) {
                        existing.setStock(100);
                    }
                    existing.serializeTags();
                    return productRepository.save(existing).then();
                }
            });
    }
}
