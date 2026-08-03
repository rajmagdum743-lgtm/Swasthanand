package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class InventoryChangedEvent extends ApplicationEvent {
    private final String productId;
    private final String dealershipNodeId;
    private final int changeQuantity;
    private final int resultingStock;
    private final String transactionType; // INCREMENT, DECREMENT, RESERVE, RELEASE
    private final String reason;
    private final String performedBy;

    public InventoryChangedEvent(Object source, String productId, String dealershipNodeId, 
                                 int changeQuantity, int resultingStock, 
                                 String transactionType, String reason, String performedBy) {
        super(source);
        this.productId = productId;
        this.dealershipNodeId = dealershipNodeId;
        this.changeQuantity = changeQuantity;
        this.resultingStock = resultingStock;
        this.transactionType = transactionType;
        this.reason = reason;
        this.performedBy = performedBy;
    }
}
