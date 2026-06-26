package com.swasthanand.api.controller;

import com.swasthanand.api.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @GetMapping("/states")
    public Mono<ResponseEntity<List<String>>> getStates() {
        return Mono.just(ResponseEntity.ok(locationService.getStates()));
    }

    @GetMapping("/districts/{state}")
    public Mono<ResponseEntity<List<String>>> getDistricts(@PathVariable String state) {
        return Mono.just(ResponseEntity.ok(locationService.getDistricts(state)));
    }
}
