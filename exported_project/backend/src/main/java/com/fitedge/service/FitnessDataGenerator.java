package com.fitedge.service;

import lombok.Data;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class FitnessDataGenerator {

    private final SimpMessagingTemplate messagingTemplate;
    private final Random random = new Random();

    public FitnessDataGenerator(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Scheduled(fixedRate = 2000)
    public void sendRealTimeUpdate() {
        FitnessUpdate update = new FitnessUpdate();
        update.setHeartRate(70 + random.nextInt(40));
        update.setSteps(random.nextInt(10));
        update.setCalories(random.nextInt(5));
        
        messagingTemplate.convertAndSend("/topic/fitness", update);
    }

    @Data
    public static class FitnessUpdate {
        private int heartRate;
        private int steps;
        private int calories;
    }
}
