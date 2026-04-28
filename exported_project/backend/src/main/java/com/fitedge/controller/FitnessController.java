package com.fitedge.controller;

import com.fitedge.entity.User;
import com.fitedge.repository.UserRepository;
import com.fitedge.service.GoogleFitService;
import com.fitedge.service.RecommendationService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
@CrossOrigin(origins = "http://localhost:4200")
public class FitnessController {

    private final GoogleFitService googleFitService;
    private final RecommendationService recommendationService;
    private final UserRepository userRepository;

    public FitnessController(GoogleFitService googleFitService, 
                             RecommendationService recommendationService,
                             UserRepository userRepository) {
        this.googleFitService = googleFitService;
        this.recommendationService = recommendationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/data")
    public Map<String, Object> getFitnessData(OAuth2AuthenticationToken authentication) throws IOException {
        if (authentication == null) return Map.of("error", "Not authenticated");
        return googleFitService.getFitnessData(authentication);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(OAuth2AuthenticationToken authentication) {
        if (authentication == null) return Map.of("error", "Not authenticated");
        return googleFitService.getUserSummary(authentication);
    }

    @PostMapping("/physical")
    public Map<String, Object> updatePhysical(@RequestBody Map<String, Double> payload, OAuth2AuthenticationToken authentication) {
        if (authentication == null) return Map.of("error", "Not authenticated");
        String email = authentication.getPrincipal().getAttribute("email");
        User user = userRepository.findByEmail(email).orElseThrow();
        user.setWeight(payload.get("weight"));
        user.setHeight(payload.get("height"));
        userRepository.save(user);
        return Map.of("success", true);
    }

    @GetMapping("/recommendations")
    public List<RecommendationService.ExerciseRecommendation> getRecommendations(OAuth2AuthenticationToken authentication) {
        if (authentication == null) {
            return recommendationService.getRecommendations(0, 0);
        }
        String email = authentication.getPrincipal().getAttribute("email");
        User user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return recommendationService.getRecommendations(0, 0);
        return recommendationService.getRecommendations(user.getWeight(), user.getHeight());
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
