package com.swasthanand.api.service;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class GeofencingServiceTest {

    private final GeofencingService geofencingService = new GeofencingService();

    @Test
    public void testIsWithinGeofence_Success() {
        // Pune Center (18.5204, 73.8567) and Swargate (18.5018, 73.8636) ~ 2.2 km away
        boolean result = geofencingService.isWithinGeofence(18.5018, 73.8636, 18.5204, 73.8567, 5.0);
        assertTrue(result, "Point should be within 5km geofence radius.");
    }

    @Test
    public void testIsWithinGeofence_OutsideRadius() {
        // Pune Center (18.5204, 73.8567) and Mumbai (19.0760, 72.8777) ~ 120 km away
        boolean result = geofencingService.isWithinGeofence(19.0760, 72.8777, 18.5204, 73.8567, 10.0);
        assertFalse(result, "Point should be outside 10km geofence radius.");
    }
}
