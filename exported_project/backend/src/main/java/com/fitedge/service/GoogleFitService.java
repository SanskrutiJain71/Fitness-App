package com.fitedge.service;

import com.fitedge.entity.FitnessData;
import com.fitedge.entity.SleepData;
import com.fitedge.entity.User;
import com.fitedge.repository.FitnessDataRepository;
import com.fitedge.repository.SleepDataRepository;
import com.fitedge.repository.UserRepository;
import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.fitness.Fitness;
import com.google.api.services.fitness.model.AggregateBy;
import com.google.api.services.fitness.model.AggregateRequest;
import com.google.api.services.fitness.model.Dataset;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Service
public class GoogleFitService {

    private final OAuth2AuthorizedClientService authorizedClientService;
    private final UserRepository userRepository;
    private final FitnessDataRepository fitnessDataRepository;
    private final SleepDataRepository sleepDataRepository;

    public GoogleFitService(OAuth2AuthorizedClientService authorizedClientService, 
                            UserRepository userRepository, 
                            FitnessDataRepository fitnessDataRepository,
                            SleepDataRepository sleepDataRepository) {
        this.authorizedClientService = authorizedClientService;
        this.userRepository = userRepository;
        this.fitnessDataRepository = fitnessDataRepository;
        this.sleepDataRepository = sleepDataRepository;
    }

    public Map<String, Object> getFitnessData(OAuth2AuthenticationToken authentication) throws IOException {
        String email = authentication.getPrincipal().getAttribute("email");
        String name = authentication.getPrincipal().getAttribute("name");
        
        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail(email);
            newUser.setName(name);
            return userRepository.save(newUser);
        });

        OAuth2AuthorizedClient client = authorizedClientService.loadAuthorizedClient(
                authentication.getAuthorizedClientRegistrationId(),
                authentication.getName());

        String accessToken = client.getAccessToken().getTokenValue();

        Credential credential = new GoogleCredential().setAccessToken(accessToken);
        Fitness fitness = new Fitness.Builder(new NetHttpTransport(), new GsonFactory(), credential)
                .setApplicationName("FitEdge")
                .build();

        // Simulate fetching actual data and saving it
        FitnessData fitnessData = fitnessDataRepository.findByUser(user).orElse(new FitnessData());
        fitnessData.setUser(user);
        fitnessData.setSteps(5432); // In reality, parse from fitness API
        fitnessData.setCalories(450);
        fitnessData.setHeartRate(72);
        fitnessData.setUpdatedAt(java.time.LocalDateTime.now());
        fitnessDataRepository.save(fitnessData);

        // Simulated Sleep Data Integration
        if (sleepDataRepository.findByUserOrderByDateDesc(user).isEmpty()) {
            java.time.LocalDate today = java.time.LocalDate.now();
            for (int i = 0; i < 7; i++) {
                com.fitedge.entity.SleepData sleep = new com.fitedge.entity.SleepData();
                sleep.setUser(user);
                sleep.setDate(today.minusDays(i));
                sleep.setHours(6 + Math.random() * 3);
                sleep.setDeepSleepMinutes(120 + (int)(Math.random() * 60));
                sleep.setLightSleepMinutes(300 + (int)(Math.random() * 60));
                sleepDataRepository.save(sleep);
            }
        }

        Map<String, Object> result = new HashMap<>();
        result.put("name", user.getName());
        result.put("email", user.getEmail());
        result.put("steps", fitnessData.getSteps());
        result.put("calories", fitnessData.getCalories());
        result.put("heartRate", fitnessData.getHeartRate());
        
        return result;
    }

    public Map<String, Object> getUserSummary(OAuth2AuthenticationToken authentication) {
        String email = authentication.getPrincipal().getAttribute("email");
        User user = userRepository.findByEmail(email).orElse(null);
        Map<String, Object> result = new HashMap<>();
        
        if (user != null) {
            FitnessData fitnessData = fitnessDataRepository.findByUser(user).orElse(new FitnessData());
            List<com.fitedge.entity.SleepData> sleepHistory = sleepDataRepository.findByUserOrderByDateDesc(user);
            
            result.put("name", user.getName());
            result.put("email", user.getEmail());
            result.put("weight", user.getWeight());
            result.put("height", user.getHeight());
            result.put("steps", fitnessData.getSteps());
            result.put("calories", fitnessData.getCalories());
            result.put("heartRate", fitnessData.getHeartRate());
            result.put("sleepHistory", sleepHistory);
            
            if (!sleepHistory.isEmpty()) {
                result.put("lastSleep", sleepHistory.get(0).getHours());
            }
        } else {
            result.put("steps", 0);
            result.put("calories", 0);
            result.put("heartRate", 0);
            result.put("sleepHistory", Collections.emptyList());
        }
        return result;
    }
}
