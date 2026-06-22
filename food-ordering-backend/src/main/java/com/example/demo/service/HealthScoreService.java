package com.example.demo.service;

import com.example.demo.dao.HealthScoreDAO;
import com.example.demo.model.HealthScore;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class HealthScoreService {

    @Autowired
    HealthScoreDAO healthScoreDAO;

    public HealthScore calculateScore(
            int foodId) {

        HealthScore food =
                healthScoreDAO
                        .getFoodNutrition(foodId);

        int score = 0;

        if(food.getCalories() <= 300)
            score += 3;

        if(food.getProtein() >= 15)
            score += 4;

        if(food.getFat() <= 10)
            score += 3;

        food.setHealthScore(score);

        return food;
    }
}