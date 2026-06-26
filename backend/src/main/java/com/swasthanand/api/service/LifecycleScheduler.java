package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Configuration
@EnableScheduling
@Service
@RequiredArgsConstructor
@Slf4j
public class LifecycleScheduler {

    private final ProductRepository productRepository;
    private final ProductLifecycleStateMachine stateMachine;

    // Runs every hour to check for expired products or inventory alerts
    @Scheduled(cron = "0 0 * * * *")
    public void checkProductExpirationsAndInventory() {
        log.info("Running automated lifecycle scheduler check...");
        
        LocalDate today = LocalDate.now();
        
        productRepository.findAll()
                .filter(p -> p.getExpiryDate() != null && p.getExpiryDate().isBefore(today) 
                        && p.getStatus() != Product.LifecycleState.EXPIRED)
                .flatMap(p -> stateMachine.triggerTransition(p.getId(), ProductLifecycleStateMachine.LifecycleEvent.EXPIRE, "Expired by Scheduler"))
                .doOnNext(p -> log.warn("Product batch {} (SKU: {}) has EXPIRED automatically.", p.getBatchId(), p.getSku()))
                .subscribe();

        productRepository.findAll()
                .filter(p -> p.getStock() != null && p.getStock() < 10)
                .doOnNext(p -> log.warn("LOW STOCK ALERT: Product {} (SKU: {}) has stock {} left.", 
                        p.getName(), p.getSku(), p.getStock()))
                .subscribe();
    }
}
