package com.swasthanand.api.controller;

import com.swasthanand.api.dto.GoalSuggestionRequest;
import com.swasthanand.api.dto.RecommendationRequest;
import com.swasthanand.api.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/recommend")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;

    @PostMapping
    public Mono<ResponseEntity<Object>> getRecommendations(@RequestBody RecommendationRequest request) {
        return recommendationService.getRecommendations(request)
                .map(res -> ResponseEntity.ok().body((Object) res))
                .onErrorResume(e -> {
                    log.error("Error processing recommendation", e);
                    return Mono.just(ResponseEntity.internalServerError().body((Object) "An error occurred while calculating recommendations. Please try again later."));
                });
    }

    @PostMapping("/smart-goal")
    public Mono<ResponseEntity<Object>> getGoalRecommendations(@RequestBody GoalSuggestionRequest request) {
        return recommendationService.getSmartGoalRecommendations(request)
                .map(res -> ResponseEntity.ok().body((Object) res))
                .onErrorResume(e -> {
                    log.error("Error processing goal recommendation", e);
                    return Mono.just(ResponseEntity.internalServerError().body((Object) "An error occurred while analyzing your goal."));
                });
    }
}
