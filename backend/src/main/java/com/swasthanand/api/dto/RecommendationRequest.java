package com.swasthanand.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class RecommendationRequest {
    private int age;
    private double weight; // in kg
    private Double height; // optional, in cm
    private String goal;
    private List<String> diseases;
    private List<String> allergies;
    private String activityLevel;
}
