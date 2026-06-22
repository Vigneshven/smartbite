package com.example.demo.controller;

import com.example.demo.model.HealthScore;
import com.example.demo.service.HealthScoreService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/health")
@CrossOrigin("*")
public class HealthScoreController {

    @Autowired
    HealthScoreService healthScoreService;

    @GetMapping("/{foodId}")
    public HealthScore getHealthScore(
            @PathVariable int foodId) {

        return healthScoreService
                .calculateScore(foodId);
    }
}