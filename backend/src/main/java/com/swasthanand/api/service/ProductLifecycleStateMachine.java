package com.swasthanand.api.service;

import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductLifecycleStateMachine {

    private final ProductRepository productRepository;

    public enum LifecycleEvent {
        MANUFACTURE,
        SUBMIT_QC,
        PASS_QC,
        FAIL_QC,
        SEND_TO_WAREHOUSE,
        ALLOCATE_DEALER,
        SHIP,
        DELIVER,
        PURCHASE,
        RETURN,
        EXPIRE,
        DESTROY
    }

    public Mono<Product> triggerTransition(String productId, LifecycleEvent event, String detail) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    Product.LifecycleState currentState = product.getStatus();
                    if (currentState == null) {
                        currentState = Product.LifecycleState.MANUFACTURED;
                    }
                    
                    Product.LifecycleState nextState = computeNextState(currentState, event);
                    if (nextState == null) {
                        return Mono.error(new IllegalArgumentException("Invalid state transition from " + currentState + " via event " + event));
                    }
                    
                    if (nextState == currentState && event != LifecycleEvent.ALLOCATE_DEALER) {
                        return Mono.just(product);
                    }

                    log.info("[STATE-MACHINE] Transitioning product {} from {} to {} via event {}", 
                            productId, currentState, nextState, event);
                    
                    product.setStatus(nextState);

                    if (event == LifecycleEvent.ALLOCATE_DEALER) {
                        product.setDealershipNodeId(detail);
                    }

                    product.serializeTags();
                    return productRepository.save(product)
                            .map(saved -> {
                                saved.deserializeTags();
                                return saved;
                            });
                });
    }

    public Product.LifecycleState computeNextState(Product.LifecycleState current, LifecycleEvent event) {
        if (event == LifecycleEvent.EXPIRE) {
            if (current == Product.LifecycleState.QC_PASSED ||
                current == Product.LifecycleState.WAREHOUSE ||
                current == Product.LifecycleState.DEALER_ALLOCATED ||
                current == Product.LifecycleState.IN_TRANSIT ||
                current == Product.LifecycleState.DELIVERED) {
                return Product.LifecycleState.EXPIRED;
            }
            return null;
        }

        if (event == LifecycleEvent.DESTROY) {
            if (current == Product.LifecycleState.EXPIRED ||
                current == Product.LifecycleState.RETURNED ||
                current == Product.LifecycleState.QC_PENDING ||
                current == Product.LifecycleState.MANUFACTURED) {
                return Product.LifecycleState.DESTROYED;
            }
            return null;
        }

        switch (current) {
            case MANUFACTURED:
                if (event == LifecycleEvent.SUBMIT_QC) return Product.LifecycleState.QC_PENDING;
                break;
            case QC_PENDING:
                if (event == LifecycleEvent.PASS_QC) return Product.LifecycleState.QC_PASSED;
                if (event == LifecycleEvent.FAIL_QC) return Product.LifecycleState.DESTROYED;
                break;
            case QC_PASSED:
                if (event == LifecycleEvent.SEND_TO_WAREHOUSE) return Product.LifecycleState.WAREHOUSE;
                if (event == LifecycleEvent.ALLOCATE_DEALER) return Product.LifecycleState.DEALER_ALLOCATED;
                break;
            case WAREHOUSE:
                if (event == LifecycleEvent.ALLOCATE_DEALER) return Product.LifecycleState.DEALER_ALLOCATED;
                break;
            case DEALER_ALLOCATED:
                if (event == LifecycleEvent.SHIP) return Product.LifecycleState.IN_TRANSIT;
                if (event == LifecycleEvent.PURCHASE) return Product.LifecycleState.SOLD;
                break;
            case IN_TRANSIT:
                if (event == LifecycleEvent.DELIVER) return Product.LifecycleState.DELIVERED;
                if (event == LifecycleEvent.RETURN) return Product.LifecycleState.RETURNED;
                break;
            case DELIVERED:
                if (event == LifecycleEvent.PURCHASE) return Product.LifecycleState.SOLD;
                if (event == LifecycleEvent.RETURN) return Product.LifecycleState.RETURNED;
                break;
            case SOLD:
                if (event == LifecycleEvent.RETURN) return Product.LifecycleState.RETURNED;
                break;
            case RETURNED:
                if (event == LifecycleEvent.SEND_TO_WAREHOUSE) return Product.LifecycleState.WAREHOUSE;
                break;
            default:
                break;
        }
        return null;
    }
}
