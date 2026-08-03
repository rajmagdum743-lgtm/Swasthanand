package com.swasthanand.api.service;

import com.swasthanand.api.dto.GoalSuggestionRequest;
import com.swasthanand.api.dto.RecommendationRequest;
import com.swasthanand.api.dto.RecommendationResponse;
import com.swasthanand.api.model.Product;
import com.swasthanand.api.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.test.StepVerifier;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class RecommendationServiceTest {

    @Mock
    private ProductRepository productRepository;

    private RecommendationService recommendationService;
    private Product turmeric;
    private Product ghee;

    @BeforeEach
    public void setUp() {
        recommendationService = new RecommendationService(productRepository);
        
        turmeric = Product.builder()
                .id("prod-turmeric")
                .name("Organic Turmeric Finger")
                .category("Spices")
                .description("Turmeric finger")
                .benefitsDescription("Fights inflammation")
                .price(new BigDecimal("299"))
                .tags(new ArrayList<>(List.of("immunity", "weight-loss", "inflammation")))
                .stock(100)
                .build();
        turmeric.serializeTags();

        ghee = Product.builder()
                .id("prod-ghee")
                .name("Pure A2 Ghee")
                .category("Dairy")
                .description("Grass-fed cow ghee")
                .benefitsDescription("Lubricates intestines")
                .price(new BigDecimal("850"))
                .tags(new ArrayList<>(List.of("energy", "digestion", "skin")))
                .stock(100)
                .build();
        ghee.serializeTags();
    }

    @Test
    public void testGetRecommendations_WeightLoss() {
        when(productRepository.findAll()).thenReturn(Flux.just(turmeric, ghee));

        RecommendationRequest request = new RecommendationRequest();
        request.setAge(30);
        request.setWeight(80.0);
        request.setHeight(175.0);
        request.setGoal("weight-loss");
        request.setDiseases(List.of("inflammation"));
        request.setAllergies(new ArrayList<>());

        StepVerifier.create(recommendationService.getRecommendations(request))
                .expectNextMatches(response -> {
                    assertNotNull(response.getProfileSummary());
                    assertTrue(response.getProfileSummary().getBmi() > 25.0);
                    assertEquals("Overweight (Kapha Accumulation)", response.getProfileSummary().getBmiStatus());
                    assertFalse(response.getRecommendations().isEmpty());
                    assertEquals("prod-turmeric", response.getRecommendations().get(0).getId());
                    return true;
                })
                .verifyComplete();
    }

    @Test
    public void testGetRecommendations_AllergyFiltering() {
        when(productRepository.findAll()).thenReturn(Flux.just(turmeric, ghee));

        RecommendationRequest request = new RecommendationRequest();
        request.setAge(30);
        request.setWeight(60.0);
        request.setHeight(170.0);
        request.setGoal("immunity");
        request.setAllergies(List.of("Turmeric"));

        StepVerifier.create(recommendationService.getRecommendations(request))
                .expectNextMatches(response -> {
                    // Turmeric matches goal but should be filtered out by allergy
                    assertTrue(response.getRecommendations().isEmpty());
                    return true;
                })
                .verifyComplete();
    }

    @Test
    public void testGetSmartGoalRecommendations() {
        when(productRepository.findAll()).thenReturn(Flux.just(turmeric, ghee));

        GoalSuggestionRequest request = new GoalSuggestionRequest();
        request.setAge(30);
        request.setWeight(75.0);
        request.setGoal("I want to boost immunity and skin glow");
        request.setAllergies(new ArrayList<>());

        StepVerifier.create(recommendationService.getSmartGoalRecommendations(request))
                .expectNextMatches(list -> {
                    assertFalse(list.isEmpty());
                    assertTrue(list.size() <= 3);
                    return true;
                })
                .verifyComplete();
    }
}
