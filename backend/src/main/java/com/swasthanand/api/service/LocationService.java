package com.swasthanand.api.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.util.*;

@Service
public class LocationService {

    private Map<String, List<String>> stateDistrictMap = new HashMap<>();

    @PostConstruct
    public void init() {
        try {
            ObjectMapper mapper = new ObjectMapper();
            InputStream is = new ClassPathResource("data/locations.json").getInputStream();
            stateDistrictMap = mapper.readValue(is, new TypeReference<Map<String, List<String>>>() {});
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public List<String> getStates() {
        List<String> states = new ArrayList<>(stateDistrictMap.keySet());
        Collections.sort(states);
        return states;
    }

    public List<String> getDistricts(String state) {
        List<String> districts = stateDistrictMap.getOrDefault(state, new ArrayList<>());
        Collections.sort(districts);
        return districts;
    }
}
