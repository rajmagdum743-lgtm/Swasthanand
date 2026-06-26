package com.swasthanand.api.service;

import com.swasthanand.api.dto.GoalSuggestionRequest;
import com.swasthanand.api.dto.RecommendationRequest;
import com.swasthanand.api.dto.RecommendationResponse;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final ProductRepository productRepository;

    public Mono<RecommendationResponse> getRecommendations(RecommendationRequest request) {
        double bmi;
        if (request.getHeight() != null && request.getHeight() > 0) {
            double heightInMeters = request.getHeight() / 100.0;
            bmi = request.getWeight() / (heightInMeters * heightInMeters);
        } else {
            bmi = request.getWeight() / (double) request.getAge();
        }

        String bmiStatus = getBmiStatus(bmi, request.getHeight() != null);
        final double finalBmi = bmi;

        return productRepository.findAll()
            .map(product -> {
                product.deserializeTags();
                return product;
            })
            .filter(product -> matchesGoalOrDiseases(product, request))
            .map(product -> buildRecommendedProduct(product, request))
            .collectList()
            .map(recommendations -> {
                if ("weight-loss".equalsIgnoreCase(request.getGoal()) && finalBmi > 25) {
                    recommendations.sort((a, b) -> {
                        if (a.getName().toLowerCase().contains("turmeric") || a.getName().toLowerCase().contains("ghee")) return -1;
                        return 1;
                    });
                }

                return RecommendationResponse.builder()
                    .profileSummary(RecommendationResponse.HealthProfile.builder()
                        .bmi(Math.round(finalBmi * 10) / 10.0)
                        .bmiStatus(bmiStatus)
                        .ayurvedicInsight(getAyurvedicInsight(request, finalBmi))
                        .build())
                    .recommendations(recommendations)
                    .build();
            });
    }

    public Mono<List<RecommendationResponse.RecommendedProduct>> getSmartGoalRecommendations(GoalSuggestionRequest request) {
        String goal = request.getGoal();
        if (goal == null || goal.trim().isEmpty()) {
            return Mono.just(List.of());
        }

        String[] tokens = goal.toLowerCase().split("\\s+");

        return productRepository.findAll()
            .map(product -> {
                product.deserializeTags();
                return product;
            })
            .filter(product -> !isAllergic(product, request.getAllergies()))
            .map(product -> new ScoredProduct(product, calculateScore(product, tokens)))
            .filter(sp -> sp.score > 0)
            .sort((a, b) -> Integer.compare(b.score, a.score))
            .take(3)
            .map(sp -> buildRecommendedProductForGoal(sp.product, request))
            .collectList();
    }

    private static class ScoredProduct {
        final Product product;
        final int score;
        ScoredProduct(Product product, int score) {
            this.product = product;
            this.score = score;
        }
    }

    private boolean isAllergic(Product product, List<String> allergies) {
        if (allergies == null || allergies.isEmpty()) return false;
        for (String allergy : allergies) {
            String allergen = allergy.toLowerCase();
            if (product.getName().toLowerCase().contains(allergen) || 
                product.getCategory().toLowerCase().contains(allergen) ||
                (product.getTags() != null && product.getTags().stream().anyMatch(t -> t.toLowerCase().contains(allergen)))) {
                return true;
            }
        }
        return false;
    }

    private static final java.util.Map<String, String> KEYWORD_TO_TAG = new java.util.HashMap<>();
    static {
        KEYWORD_TO_TAG.put("weight", "weight-loss");
        KEYWORD_TO_TAG.put("lose", "weight-loss");
        KEYWORD_TO_TAG.put("fat", "weight-loss");
        KEYWORD_TO_TAG.put("slim", "weight-loss");
        KEYWORD_TO_TAG.put("obesity", "weight-loss");
        KEYWORD_TO_TAG.put("overweight", "weight-loss");
        KEYWORD_TO_TAG.put("immun", "immunity");
        KEYWORD_TO_TAG.put("boost", "immunity");
        KEYWORD_TO_TAG.put("protect", "immunity");
        KEYWORD_TO_TAG.put("strong", "immunity");
        KEYWORD_TO_TAG.put("defense", "immunity");
        KEYWORD_TO_TAG.put("digest", "digestion");
        KEYWORD_TO_TAG.put("gut", "digestion");
        KEYWORD_TO_TAG.put("stomach", "digestion");
        KEYWORD_TO_TAG.put("acid", "digestion");
        KEYWORD_TO_TAG.put("bloat", "digestion");
        KEYWORD_TO_TAG.put("energy", "energy");
        KEYWORD_TO_TAG.put("tired", "energy");
        KEYWORD_TO_TAG.put("fatigue", "energy");
        KEYWORD_TO_TAG.put("stamina", "energy");
        KEYWORD_TO_TAG.put("vital", "energy");
        KEYWORD_TO_TAG.put("activ", "energy");
        KEYWORD_TO_TAG.put("skin", "skin");
        KEYWORD_TO_TAG.put("glow", "skin");
        KEYWORD_TO_TAG.put("acne", "skin");
        KEYWORD_TO_TAG.put("radianc", "skin");
        KEYWORD_TO_TAG.put("complex", "skin");
        KEYWORD_TO_TAG.put("joint", "joint-pain");
        KEYWORD_TO_TAG.put("bone", "joint-pain");
        KEYWORD_TO_TAG.put("arthr", "joint-pain");
        KEYWORD_TO_TAG.put("pain", "joint-pain");
        KEYWORD_TO_TAG.put("knee", "joint-pain");
        KEYWORD_TO_TAG.put("inflam", "inflammation");
        KEYWORD_TO_TAG.put("swel", "inflammation");
    }

    private int calculateScore(Product product, String[] tokens) {
        int score = 0;
        String name = product.getName().toLowerCase();
        String desc = (product.getDescription() != null ? product.getDescription().toLowerCase() : "");
        String benefits = (product.getBenefitsDescription() != null ? product.getBenefitsDescription().toLowerCase() : "");
        List<String> tags = product.getTags() != null ? product.getTags() : List.of();

        for (String token : tokens) {
            if (token.length() < 3) continue;

            if (name.contains(token)) score += 10;
            if (benefits.contains(token)) score += 5;
            if (desc.contains(token)) score += 2;

            for (String tag : tags) {
                if (tag.toLowerCase().contains(token)) {
                    score += 8;
                }
            }

            for (java.util.Map.Entry<String, String> entry : KEYWORD_TO_TAG.entrySet()) {
                if (token.startsWith(entry.getKey()) || entry.getKey().startsWith(token)) {
                    String mappedTag = entry.getValue();
                    for (String tag : tags) {
                        if (tag.equalsIgnoreCase(mappedTag)) {
                            score += 12;
                            break;
                        }
                    }
                    break;
                }
            }
        }
        return score;
    }

    private RecommendationResponse.RecommendedProduct buildRecommendedProductForGoal(Product product, GoalSuggestionRequest request) {
        String dosage = calculateDosage(product, request.getAge(), request.getWeight());
        String timeline = calculateTimeline(product, request.getGoal(), request.getDiseases());

        return RecommendationResponse.RecommendedProduct.builder()
            .id(product.getId())
            .name(product.getName())
            .expertBenefit(product.getBenefitsDescription() != null ? product.getBenefitsDescription() : "Natural Ayurvedic support for your wellness journey.")
            .chosenReason("Aligned with your goal: " + request.getGoal())
            .usageInstructions(dosage)
            .dosageCycle("Twice daily, preferably on empty stomach")
            .recoveryTimeline(timeline)
            .image(product.getImage())
            .build();
    }

    private boolean matchesGoalOrDiseases(Product product, RecommendationRequest request) {
        if (request.getAllergies() != null) {
            for (String allergy : request.getAllergies()) {
                String allergen = allergy.toLowerCase();
                if (product.getName().toLowerCase().contains(allergen) || 
                    product.getCategory().toLowerCase().contains(allergen) ||
                    (product.getTags() != null && product.getTags().stream().anyMatch(t -> t.toLowerCase().contains(allergen)))) {
                    return false;
                }
            }
        }

        if (product.getTags() != null && product.getTags().stream().anyMatch(tag -> tag.equalsIgnoreCase(request.getGoal()))) {
            return true;
        }

        if (request.getDiseases() != null && product.getTags() != null) {
            for (String disease : request.getDiseases()) {
                if (product.getTags().stream().anyMatch(tag -> tag.equalsIgnoreCase(disease))) {
                    return true;
                }
            }
        }

        return false;
    }

    private RecommendationResponse.RecommendedProduct buildRecommendedProduct(Product product, RecommendationRequest request) {
        String chosenReason = "Traditional remedy matching your goal: " + request.getGoal();
        
        if (request.getDiseases() != null && product.getTags() != null) {
            for (String disease : request.getDiseases()) {
                if (product.getTags().stream().anyMatch(tag -> tag.equalsIgnoreCase(disease))) {
                    chosenReason = "Chosen for its effectiveness against: " + disease;
                    break;
                }
            }
        }

        String dosage = calculateDosage(product, request.getAge(), request.getWeight());
        String timeline = calculateTimeline(product, request.getGoal(), request.getDiseases());

        return RecommendationResponse.RecommendedProduct.builder()
            .id(product.getId())
            .name(product.getName())
            .expertBenefit(product.getBenefitsDescription() != null ? product.getBenefitsDescription() : "Pure and effective Ayurvedic solution.")
            .chosenReason(chosenReason)
            .usageInstructions(dosage)
            .dosageCycle("Twice daily, preferably on empty stomach")
            .recoveryTimeline(timeline)
            .image(product.getImage())
            .build();
    }

    private String calculateDosage(Product product, int age, double weight) {
        String category = product.getCategory().toLowerCase();

        double baseAmount = 1.0;
        String unit = "spoons";

        if (category.contains("dairy") || product.getName().toLowerCase().contains("ghee")) {
            baseAmount = 2.0;
        } else if (category.contains("spices") || product.getName().toLowerCase().contains("turmeric")) {
            baseAmount = 0.5;
        } else if (category.contains("supplements")) {
            baseAmount = 1.0;
        }

        double multiplier = weight / 70.0;
        if (age > 0) {
            if (age < 12) multiplier *= 0.5;
            if (age > 65) multiplier *= 0.8;
        } else {
            multiplier = 1.0;
        }

        double rawAmount = baseAmount * multiplier;
        double finalAmount = Math.round(rawAmount * 2) / 2.0;
        
        if (finalAmount < 0.5) finalAmount = 0.5;

        String amountStr = (finalAmount == (long) finalAmount) 
            ? String.format("%d", (long) finalAmount) 
            : String.format("%.1f", finalAmount);

        return String.format("Take %s %s with warm water/milk", amountStr, unit);
    }

    private String calculateTimeline(Product product, String goal, List<String> diseases) {
        String goalStr = goal != null ? goal.toLowerCase() : "";

        if (diseases != null && (diseases.contains("diabetes") || diseases.contains("hypertension"))) {
            return "6 months (Long-term management)";
        }

        if (goalStr.contains("weight") || goalStr.contains("digestion")) {
            return "8-12 weeks (Deep detox cycle)";
        }

        return "4 weeks (Maintenance cycle)";
    }

    private String getBmiStatus(double bmi, boolean standard) {
        if (!standard) return "Age-Weight Ratio Index";
        if (bmi < 18.5) return "Underweight (Vata Imbalance Possible)";
        if (bmi < 25) return "Normal (Dhatu Balance)";
        if (bmi < 30) return "Overweight (Kapha Accumulation)";
        return "Obese (Ati-Kapha)";
    }

    private String getAyurvedicInsight(RecommendationRequest request, double bmi) {
        if (bmi > 25 || "weight-loss".equalsIgnoreCase(request.getGoal())) {
            return "Your bodily constitution suggests an excess of Kapha. We recommend light, warming herbs to ignite your digestive fire (Agni).";
        }
        return "Maintaining your Ojas (vitality) through balanced nutrition is key. Favor foods that harmonize your unique Prakriti.";
    }
}
