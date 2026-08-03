package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class ProductCreatedEvent extends ApplicationEvent {
    private final String productId;
    private final String sku;

    public ProductCreatedEvent(Object source, String productId, String sku) {
        super(source);
        this.productId = productId;
        this.sku = sku;
    }
}
