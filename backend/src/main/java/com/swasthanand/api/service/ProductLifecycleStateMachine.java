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
        QC_VERIFY, ALLOCATE, PURCHASE, EXPIRE
    }

    public Mono<Product> triggerTransition(String productId, LifecycleEvent event, String detail) {
        return productRepository.findById(productId)
                .flatMap(product -> {
                    Product.LifecycleState currentState = product.getStatus();
                    Product.LifecycleState nextState = computeNextState(currentState, event);
                    
                    if (nextState == currentState) {
                        return Mono.just(product);
                    }

                    log.info("Transitioning product {} from {} to {} via event {}", 
                            productId, currentState, nextState, event);
                    
                    product.setStatus(nextState);

                    if (event == LifecycleEvent.ALLOCATE) {
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

    private Product.LifecycleState computeNextState(Product.LifecycleState current, LifecycleEvent event) {
        if (event == LifecycleEvent.EXPIRE) {
            return Product.LifecycleState.EXPIRED;
        }

        if (current == null) {
            if (event == LifecycleEvent.QC_VERIFY) {
                return Product.LifecycleState.QC_PASSED;
            }
            return null;
        }

        switch (current) {
            case QC_PASSED:
                if (event == LifecycleEvent.ALLOCATE) {
                    return Product.LifecycleState.DEALER_ALLOCATED;
                }
                break;
            case DEALER_ALLOCATED:
                if (event == LifecycleEvent.PURCHASE) {
                    return Product.LifecycleState.SOLD;
                }
                break;
            case SOLD:
            case EXPIRED:
                break;
        }
        return current;
    }
}
