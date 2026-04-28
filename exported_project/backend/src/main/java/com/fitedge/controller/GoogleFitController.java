package com.fitedge.controller;

import com.fitedge.service.GoogleFitService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
public class GoogleFitController {

    private final GoogleFitService googleFitService;
    private final com.fitedge.service.RecommendationService recommendationService;
    private final com.fitedge.repository.UserRepository userRepository;

    public GoogleFitController(GoogleFitService googleFitService, 
                               com.fitedge.service.RecommendationService recommendationService,
                               com.fitedge.repository.UserRepository userRepository) {
        this.googleFitService = googleFitService;
        this.recommendationService = recommendationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/data")
    public Map<String, Object> getFitnessData(OAuth2AuthenticationToken authentication) throws IOException {
        return googleFitService.getFitnessData(authentication);
    }

    @GetMapping("/summary")
    public Map<String, Object> getSummary(OAuth2AuthenticationToken authentication) {
        return googleFitService.getUserSummary(authentication);
    }

    @PostMapping("/physical")
    public Map<String, Object> updatePhysical(@org.springframework.web.bind.annotation.RequestBody Map<String, Double> payload, OAuth2AuthenticationToken authentication) {
        String email = authentication.getPrincipal().getAttribute("email");
        com.fitedge.entity.User user = userRepository.findByEmail(email).orElseThrow();
        user.setWeight(payload.get("weight"));
        user.setHeight(payload.get("height"));
        userRepository.save(user);
        return Map.of("success", true);
    }

    @GetMapping("/recommendations")
    public List<com.fitedge.service.RecommendationService.ExerciseRecommendation> getRecommendations(OAuth2AuthenticationToken authentication) {
        String email = authentication.getPrincipal().getAttribute("email");
        com.fitedge.entity.User user = userRepository.findByEmail(email).orElseThrow();
        return recommendationService.getRecommendations(user.getWeight(), user.getHeight());
    }

    @GetMapping("/users")
    public List<com.fitedge.entity.User> getAllUsers() {
        return userRepository.findAll();
    }
}
