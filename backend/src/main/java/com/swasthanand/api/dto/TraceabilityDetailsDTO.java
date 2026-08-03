package com.swasthanand.api.dto;

import com.swasthanand.api.model.*;
import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class TraceabilityDetailsDTO {
    private Product product;
    private FarmBatch farmBatch;
    private DealershipNode dealershipNode;
    private List<AuditLog> lifecycleTimeline;
    private List<AuditLog> qcHistory;
    private List<AuditLog> warehouseMovement;
}
