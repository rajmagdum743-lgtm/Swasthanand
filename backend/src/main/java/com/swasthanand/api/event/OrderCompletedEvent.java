package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class OrderCompletedEvent extends ApplicationEvent {
    private final String orderId;
    private final String dealershipNodeId;

    public OrderCompletedEvent(Object source, String orderId, String dealershipNodeId) {
        super(source);
        this.orderId = orderId;
        this.dealershipNodeId = dealershipNodeId;
    }
}
