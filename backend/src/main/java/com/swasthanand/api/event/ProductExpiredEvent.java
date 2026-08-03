package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class ProductExpiredEvent extends ApplicationEvent {
    private final String productId;
    private final String batchId;

    public ProductExpiredEvent(Object source, String productId, String batchId) {
        super(source);
        this.productId = productId;
        this.batchId = batchId;
    }
}
