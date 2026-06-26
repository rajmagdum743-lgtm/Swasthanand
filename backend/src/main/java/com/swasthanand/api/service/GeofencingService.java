package com.swasthanand.api.service;

import org.springframework.stereotype.Service;

@Service
public class GeofencingService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates distance using the Haversine formula and checks if the point is within the geofence radius.
     */
    public boolean isWithinGeofence(double pointLat, double pointLon, double centerLat, double centerLon, double radiusKm) {
        double dLat = Math.toRadians(centerLat - pointLat);
        double dLon = Math.toRadians(centerLon - pointLon);

        double lat1 = Math.toRadians(pointLat);
        double lat2 = Math.toRadians(centerLat);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        
        double c = 2 * Math.asin(Math.sqrt(a));
        double distance = EARTH_RADIUS_KM * c;

        return distance <= radiusKm;
    }
}
