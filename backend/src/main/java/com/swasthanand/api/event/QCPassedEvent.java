package com.swasthanand.api.event;

import lombok.Getter;
import lombok.ToString;
import org.springframework.context.ApplicationEvent;

@Getter
@ToString
public class QCPassedEvent extends ApplicationEvent {
    private final String productId;
    private final String batchId;

    public QCPassedEvent(Object source, String productId, String batchId) {
        super(source);
        this.productId = productId;
        this.batchId = batchId;
    }
}
