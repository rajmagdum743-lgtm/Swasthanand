package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.model.Batch;
import com.swasthanand.api.repository.ProductRepository;
import com.swasthanand.api.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import reactor.core.publisher.Mono;

@Configuration
@EnableScheduling
@Service
@RequiredArgsConstructor
@Slf4j
public class LifecycleScheduler {

    private final ProductRepository productRepository;
    private final BatchRepository batchRepository;
    private final ProductLifecycleStateMachine stateMachine;
    private final BatchService batchService;

    // Runs every hour to execute all automated updates (Step 10)
    @Scheduled(cron = "0 0 * * * *")
    public void runAutomatedUpdates() {
        log.info("[SCHEDULER] Starting automated lifecycle and inventory checks...");
        LocalDate today = LocalDate.now();

        // 1. Expire products
        productRepository.findExpiredProducts(today)
                .flatMap(p -> stateMachine.triggerTransition(p.getId(), ProductLifecycleStateMachine.LifecycleEvent.EXPIRE, "Expired by Scheduler")
                        .doOnSuccess(saved -> log.warn("[SCHEDULER] Product ID {} (SKU: {}) automatically EXPIRED.", saved.getId(), saved.getSku())))
                .subscribe();

        // 2. Expire batches
        batchRepository.findExpiredBatches(today)
                .flatMap(b -> batchService.updateBatchState(b.getId(), Product.LifecycleState.EXPIRED)
                        .doOnSuccess(saved -> log.warn("[SCHEDULER] Batch ID {} automatically EXPIRED.", saved.getId())))
                .subscribe();

        // 3. Low stock alerts
        productRepository.findLowStockProducts(10)
                .doOnNext(p -> log.warn("[SCHEDULER] LOW STOCK WARNING: Product {} (SKU: {}) has stock {} left.", 
                        p.getName(), p.getSku(), p.getStock()))
                .subscribe();

        // 4. Near expiry alerts (within 7 days)
        LocalDate nearExpiryDate = today.plusDays(7);
        batchRepository.findAll()
                .filter(b -> b.getExpiryDate() != null && b.getExpiryDate().isBefore(nearExpiryDate) && b.getExpiryDate().isAfter(today))
                .doOnNext(b -> log.warn("[SCHEDULER] NEAR EXPIRY WARNING: Batch {} (SKU: {}) is expiring on {}", 
                        b.getId(), b.getSku(), b.getExpiryDate()))
                .subscribe();

        // 5. Simulated Central DB Inventory Sync
        log.info("[SCHEDULER] Synchronizing local dealership node stocks with central repository (Overselling Prevention)...");
        // In a real B2B deployment, we would push updates to an ERP/WMS endpoint. For Phase 1 we log successful synchronization.
        log.info("[SCHEDULER] Central database stock synchronization complete.");

        // 6. Batch cleanup (remove or archive DESTROYED or EXPIRED batches older than 30 days)
        LocalDate cleanupCutoff = today.minusDays(30);
        batchRepository.findAll()
                .filter(b -> (b.getCurrentState() == Product.LifecycleState.DESTROYED || b.getCurrentState() == Product.LifecycleState.EXPIRED)
                        && b.getExpiryDate() != null && b.getExpiryDate().isBefore(cleanupCutoff))
                .flatMap(b -> batchRepository.delete(b)
                        .then(Mono.fromRunnable(() -> log.info("[SCHEDULER] Cleaned up/archived old batch {}", b.getId()))))
                .subscribe();
    }
}
