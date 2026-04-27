package com.fitedge.controller;

import com.fitedge.entity.FitnessData;
import com.fitedge.service.FitnessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/fitness")
@CrossOrigin(origins = "http://localhost:4200")
public class FitnessController {

    @Autowired
    private FitnessService fitnessService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        return ResponseEntity.ok(fitnessService.getDailySummary(userId));
    }

    @PostMapping("/sync")
    public ResponseEntity<String> triggerSync(@RequestHeader("Authorization") String token) {
        String userId = extractUserId(token);
        fitnessService.syncFromGoogleFit(userId);
        return ResponseEntity.ok("Sync initiated");
    }

    private String extractUserId(String token) {
        // JWT logic here
        return "user-123"; 
    }
}
