package com.fitedge.service;

import lombok.AllArgsConstructor;
import lombok.Data;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RecommendationService {

    @Data
    @AllArgsConstructor
    public static class ExerciseRecommendation {
        private String name;
        private String type;
        private String intensity;
        private String duration;
    }

    public List<ExerciseRecommendation> getRecommendations(double weight, double height) {
        List<ExerciseRecommendation> recommendations = new ArrayList<>();
        
        if (weight <= 0 || height <= 0) {
            recommendations.add(new ExerciseRecommendation("Walking", "Cardio", "Low", "30 mins"));
            return recommendations;
        }

        double bmi = weight / ((height / 100) * (height / 100));

        if (bmi < 18.5) {
            recommendations.add(new ExerciseRecommendation("Strength Training", "Building", "Medium", "45 mins"));
            recommendations.add(new ExerciseRecommendation("Yoga", "Flexibility", "Low", "30 mins"));
        } else if (bmi < 25) {
            recommendations.add(new ExerciseRecommendation("Running", "Cardio", "High", "30 mins"));
            recommendations.add(new ExerciseRecommendation("HIIT", "Cardio", "High", "20 mins"));
        } else if (bmi < 30) {
            recommendations.add(new ExerciseRecommendation("Brisk Walking", "Cardio", "Medium", "45 mins"));
            recommendations.add(new ExerciseRecommendation("Swimming", "Full Body", "Medium", "40 mins"));
        } else {
            recommendations.add(new ExerciseRecommendation("Swimming", "Low Impact", "Low", "30 mins"));
            recommendations.add(new ExerciseRecommendation("Cycling", "Cardio", "Low", "30 mins"));
        }

        return recommendations;
    }
}
