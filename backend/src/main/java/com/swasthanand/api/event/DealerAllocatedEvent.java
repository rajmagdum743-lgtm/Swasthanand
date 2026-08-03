package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class DealerAllocatedEvent extends ApplicationEvent {
    private final String productId;
    private final String dealershipNodeId;

    public DealerAllocatedEvent(Object source, String productId, String dealershipNodeId) {
        super(source);
        this.productId = productId;
        this.dealershipNodeId = dealershipNodeId;
    }
}
