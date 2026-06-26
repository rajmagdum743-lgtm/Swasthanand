package com.swasthanand.api.dto;

import lombok.Data;
import java.util.List;

@Data
public class GoalSuggestionRequest {
    private String goal;
    private int age;
    private double weight;
    private List<String> diseases;
    private List<String> allergies;
}
