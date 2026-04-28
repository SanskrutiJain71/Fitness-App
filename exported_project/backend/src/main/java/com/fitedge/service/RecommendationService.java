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
        private String description;
        private String icon;
    }

    public List<ExerciseRecommendation> getRecommendations(double weight, double height) {
        List<ExerciseRecommendation> recommendations = new ArrayList<>();
        
        if (weight <= 0 || height <= 0) {
            recommendations.add(new ExerciseRecommendation("General Walking", "Cardio", "Low", "30 mins", "A great way to start your fitness journey. Focus on consistency.", "Footprints"));
            recommendations.add(new ExerciseRecommendation("Basic Stretching", "Flexibility", "Low", "15 mins", "Improve your range of motion and reduce muscle tension.", "Activity"));
            return recommendations;
        }

        double bmi = weight / ((height / 100) * (height / 100));

        if (bmi < 18.5) {
            recommendations.add(new ExerciseRecommendation("Progressive Strength Training", "Muscle Building", "Medium", "45 mins", "Focus on compound movements to build lean muscle mass safely.", "Zap"));
            recommendations.add(new ExerciseRecommendation("Hatha Yoga", "Flexibility", "Low", "30 mins", "Balance strength with flexibility. Great for recovery.", "Moon"));
            recommendations.add(new ExerciseRecommendation("Swimming (Laps)", "Endurance", "Medium", "30 mins", "Low impact cardio that builds full-body strength.", "ArrowUpRight"));
        } else if (bmi < 25) {
            recommendations.add(new ExerciseRecommendation("Distance Running", "Cardio", "High", "30 mins", "Maintain your cardiovascular health with steady-state running.", "Footprints"));
            recommendations.add(new ExerciseRecommendation("Advanced HIIT", "Metabolic", "High", "20 mins", "Maximal effort intervals to boost your metabolism and power.", "Flame"));
            recommendations.add(new ExerciseRecommendation("Weight Lifting", "Strength", "High", "50 mins", "Target specific muscle groups for definition and strength.", "Zap"));
        } else if (bmi < 30) {
            recommendations.add(new ExerciseRecommendation("Power Walking", "Cardio", "Medium", "45 mins", "A higher intensity walk to burn fat without overstressing joints.", "Footprints"));
            recommendations.add(new ExerciseRecommendation("Leisure Swimming", "Full Body", "Medium", "40 mins", "Utilize the resistance of water for a gentle but effective workout.", "Heart"));
            recommendations.add(new ExerciseRecommendation("Cycling (Moderate)", "Cardio", "Medium", "45 mins", "Great for burning calories while building lower body stamina.", "Activity"));
        } else {
            recommendations.add(new ExerciseRecommendation("Aqua Aerobics", "Low Impact", "Low", "30 mins", "Ideal for joint health and steady weight management.", "Heart"));
            recommendations.add(new ExerciseRecommendation("Indoor Cycling", "Cardio", "Low", "30 mins", "Maintain fixed pace to improve cardiovascular efficiency.", "Clock"));
            recommendations.add(new ExerciseRecommendation("Gentle Yoga", "Mobility", "Low", "20 mins", "Focus on breathing and slow movements to improve mobility.", "Moon"));
        }

        return recommendations;
    }
}
