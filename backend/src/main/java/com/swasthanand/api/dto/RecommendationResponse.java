package com.swasthanand.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class RecommendationResponse {
    private List<RecommendedProduct> recommendations;
    private HealthProfile profileSummary;

    @Data
    @Builder
    public static class RecommendedProduct {
        private String id;
        private String name;
        private String expertBenefit;
        private String chosenReason;
        private String recoveryTimeline;
        private String usageInstructions;
        private String dosageCycle;
        private String image;
    }

    @Data
    @Builder
    public static class HealthProfile {
        private double bmi;
        private String bmiStatus;
        private String ayurvedicInsight;
    }
}
