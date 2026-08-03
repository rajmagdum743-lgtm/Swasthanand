package com.swasthanand.api.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;
import com.swasthanand.api.model.Product;

@Getter
public class ProductLifecycleEvent extends ApplicationEvent {
    private final String productId;
    private final int oldStock;
    private final int newStock;
    private final Product.LifecycleState oldStatus;
    private final Product.LifecycleState newStatus;

    public ProductLifecycleEvent(Object source, String productId, int oldStock, int newStock, 
                                 Product.LifecycleState oldStatus, Product.LifecycleState newStatus) {
        super(source);
        this.productId = productId;
        this.oldStock = oldStock;
        this.newStock = newStock;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }
}
