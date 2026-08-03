package com.swasthanand.api.event;

import com.swasthanand.api.model.*;
import com.swasthanand.api.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductLifecycleEventListener {

    private final ProductNotificationRepository notificationRepository;
    private final AuditLogRepository auditLogRepository;
    private final InventoryHistoryRepository inventoryHistoryRepository;

    @Async
    @EventListener
    public void handleProductCreatedEvent(ProductCreatedEvent event) {
        log.info("[EVENT] Product Created: ID={}, SKU={}", event.getProductId(), event.getSku());
        AuditLog audit = AuditLog.builder()
                .action("PRODUCT_CREATED")
                .entityName("Product")
                .entityId(event.getProductId())
                .oldValue(null)
                .newValue("SKU: " + event.getSku())
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleQCPassedEvent(QCPassedEvent event) {
        log.info("[EVENT] QC Passed for Product: ID={}, Batch={}", event.getProductId(), event.getBatchId());
        AuditLog audit = AuditLog.builder()
                .action("QC_PASSED")
                .entityName("Product")
                .entityId(event.getProductId())
                .oldValue("QC_PENDING")
                .newValue("QC_PASSED | Batch: " + event.getBatchId())
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleDealerAllocatedEvent(DealerAllocatedEvent event) {
        log.info("[EVENT] Product Allocated to Dealer Node: Product={}, Node={}", event.getProductId(), event.getDealershipNodeId());
        AuditLog audit = AuditLog.builder()
                .action("DEALER_ALLOCATED")
                .entityName("Product")
                .entityId(event.getProductId())
                .oldValue("WAREHOUSE")
                .newValue("Allocated to Dealer Node: " + event.getDealershipNodeId())
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleInventoryChangedEvent(InventoryChangedEvent event) {
        log.info("[EVENT] Inventory Changed: Product={}, Node={}, Change={}, Resulting={}, Type={}, Reason={}",
                event.getProductId(), event.getDealershipNodeId(), event.getChangeQuantity(), 
                event.getResultingStock(), event.getTransactionType(), event.getReason());

        // Save inventory history
        InventoryHistory history = InventoryHistory.builder()
                .productId(event.getProductId())
                .dealershipNodeId(event.getDealershipNodeId())
                .changeQuantity(event.getChangeQuantity())
                .resultingStock(event.getResultingStock())
                .transactionType(InventoryHistory.TransactionType.valueOf(event.getTransactionType()))
                .reason(event.getReason())
                .performedBy(event.getPerformedBy())
                .timestamp(LocalDateTime.now())
                .build();

        inventoryHistoryRepository.save(history)
                .flatMap(h -> {
                    // Check for low stock alerts
                    if (event.getResultingStock() < 10) {
                        log.warn("[EVENT-ALERT] LOW STOCK WARNING: Product {} is running low! Current stock: {}", event.getProductId(), event.getResultingStock());
                    }
                    return auditLogRepository.save(AuditLog.builder()
                            .action("INVENTORY_CHANGED")
                            .entityName("Product")
                            .entityId(event.getProductId())
                            .oldValue("Stock update")
                            .newValue("Stock change: " + event.getChangeQuantity() + " | Type: " + event.getTransactionType() + " | Final: " + event.getResultingStock())
                            .performedBy(event.getPerformedBy())
                            .createdAt(LocalDateTime.now())
                            .build());
                })
                .subscribe();
    }

    @Async
    @EventListener
    public void handleProductExpiredEvent(ProductExpiredEvent event) {
        log.error("[EVENT-ALERT] BATCH EXPIRED: Product {} batch {} has expired!", event.getProductId(), event.getBatchId());
        AuditLog audit = AuditLog.builder()
                .action("PRODUCT_EXPIRED")
                .entityName("Product")
                .entityId(event.getProductId())
                .oldValue("ACTIVE")
                .newValue("EXPIRED | Batch: " + event.getBatchId())
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleProductSoldEvent(ProductSoldEvent event) {
        log.info("[EVENT] Product Sold: Product={}, Quantity={}", event.getProductId(), event.getQuantity());
        AuditLog audit = AuditLog.builder()
                .action("PRODUCT_SOLD")
                .entityName("Product")
                .entityId(event.getProductId())
                .oldValue("ACTIVE")
                .newValue("Sold: " + event.getQuantity() + " items")
                .performedBy("Customer")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleOrderCompletedEvent(OrderCompletedEvent event) {
        log.info("[EVENT] Order Completed: Order={}, Node={}", event.getOrderId(), event.getDealershipNodeId());
        AuditLog audit = AuditLog.builder()
                .action("ORDER_COMPLETED")
                .entityName("Order")
                .entityId(event.getOrderId())
                .oldValue("PROCESSING")
                .newValue("COMPLETED | Node: " + event.getDealershipNodeId())
                .performedBy("System")
                .createdAt(LocalDateTime.now())
                .build();
        auditLogRepository.save(audit).subscribe();
    }

    @Async
    @EventListener
    public void handleProductLifecycleEvent(ProductLifecycleEvent event) {
        log.info("[EVENT] Received ProductLifecycleEvent for product {}: Stock {} -> {}, Status {} -> {}",
                event.getProductId(), event.getOldStock(), event.getNewStock(), event.getOldStatus(), event.getNewStatus());

        // 1. Stock Replenished Trigger (Stock went from 0 to > 0)
        if (event.getOldStock() == 0 && event.getNewStock() > 0) {
            log.info("[EVENT] Product {} replenished! Sending notifications to subscribers...", event.getProductId());
            notificationRepository.findByProductIdAndNotifiedFalse(event.getProductId())
                    .flatMap(notification -> {
                        log.info("[SMS-NOTIFY] Notifying subscriber {} that product {} is back in stock!", 
                                notification.getContactInfo(), event.getProductId());
                        notification.setNotified(true);
                        return notificationRepository.save(notification);
                    })
                    .subscribe(
                            null,
                            err -> log.error("[EVENT-ERR] Failed to notify subscriber for product {}: {}", event.getProductId(), err.getMessage())
                    );
        }

        // 2. Low Stock Alert Trigger
        if (event.getNewStock() > 0 && event.getNewStock() < 10 && event.getOldStock() >= 10) {
            log.warn("[EVENT-ALERT] LOW STOCK WARNING: Product {} is running low! Current stock: {}", event.getProductId(), event.getNewStock());
        }

        // 3. Status Change alerts
        if (event.getOldStatus() != event.getNewStatus() && event.getNewStatus() == Product.LifecycleState.EXPIRED) {
            log.error("[EVENT-ALERT] BATCH EXPIRED: Product {} batch has expired!", event.getProductId());
        }
    }
}
