package com.swasthanand.api.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class LocationServiceTest {

    private LocationService locationService;

    @BeforeEach
    public void setUp() {
        locationService = new LocationService();
        locationService.init();
    }

    @Test
    public void testGetStates() {
        assertNotNull(locationService.getStates());
        assertFalse(locationService.getStates().isEmpty());
    }

    @Test
    public void testGetDistricts() {
        String state = locationService.getStates().get(0);
        assertNotNull(locationService.getDistricts(state));
    }
}
