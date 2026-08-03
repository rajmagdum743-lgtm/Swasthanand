package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class ProductSoldEvent extends ApplicationEvent {
    private final String productId;
    private final int quantity;

    public ProductSoldEvent(Object source, String productId, int quantity) {
        super(source);
        this.productId = productId;
        this.quantity = quantity;
    }
}
