package com.fitedge.service;

import com.fitedge.entity.FitnessData;
import com.fitedge.repository.FitnessDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;

@Service
public class FitnessService {

    @Autowired
    private FitnessDataRepository repository;

    public Map<String, Object> getDailySummary(String userId) {
        Map<String, Object> summary = new HashMap<>();
        summary.put("steps", repository.sumStepsByUserId(userId));
        summary.put("calories", repository.sumCaloriesByUserId(userId));
        summary.put("distance", repository.sumDistanceByUserId(userId));
        summary.put("heartRate", 72); // Real-time sensing logic here
        return summary;
    }

    public void syncFromGoogleFit(String userId) {
        // OAuth 2.0 Flow:
        // 1. Get Access Token from Database
        // 2. Query Google Fitness REST API (v1/users/me/dataset/...)
        // 3. Persist new data points to 'fitness_data' table
        System.out.println("Syncing user: " + userId);
    }
}
