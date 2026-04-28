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
    public Map<String, Object> updatePhysical(@RequestBody Map<String, Object> payload, OAuth2AuthenticationToken authentication) {
        String email;
        if (authentication != null) {
            email = authentication.getPrincipal().getAttribute("email");
        } else {
            email = (String) payload.get("email");
        }

        if (email == null || email.isEmpty()) {
            return Map.of("error", "Email is required to save physical data");
        }

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName((String) payload.getOrDefault("name", "User"));
            return newUser;
        });

        if (payload.containsKey("weight")) user.setWeight(Double.parseDouble(payload.get("weight").toString()));
        if (payload.containsKey("height")) user.setHeight(Double.parseDouble(payload.get("height").toString()));
        
        userRepository.save(user);
        return Map.of("success", true, "weight", user.getWeight(), "height", user.getHeight());
    }

    @GetMapping("/recommendations")
    public List<RecommendationService.ExerciseRecommendation> getRecommendations(
            @RequestParam(required = false) String email,
            OAuth2AuthenticationToken authentication) {
        
        Double weight = 0.0;
        Double height = 0.0;

        if (authentication != null) {
            String authEmail = authentication.getPrincipal().getAttribute("email");
            User user = userRepository.findByEmail(authEmail).orElse(null);
            if (user != null) {
                weight = user.getWeight();
                height = user.getHeight();
            }
        } else if (email != null && !email.isEmpty()) {
            User user = userRepository.findByEmail(email).orElse(null);
            if (user != null) {
                weight = user.getWeight();
                height = user.getHeight();
            }
        }

        return recommendationService.getRecommendations(weight, height);
    }

    @GetMapping("/users")
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
