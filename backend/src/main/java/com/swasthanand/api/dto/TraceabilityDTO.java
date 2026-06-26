package com.swasthanand.api.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class TraceabilityDTO {
    private String id;
    private LocalDate harvestDate;
    private String region;
    private String soilTestUrl;
    private String weatherSnapshot;
}
