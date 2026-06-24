package com.example.demo.service;

import com.example.demo.dao.HealthScoreDAO;
import com.example.demo.model.HealthScore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HealthScoreService {

    @Autowired
    HealthScoreDAO healthScoreDAO;

    public HealthScore calculateScore(
            int foodId) {

        HealthScore food;
        try {
            food = healthScoreDAO.getFoodNutrition(foodId);
        } catch (EmptyResultDataAccessException ex) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Food not found",
                    ex);
        }

        int score = 0;

        if (food.getCalories() <= 300)
            score += 3;

        if (food.getProtein() >= 15)
            score += 4;

        if (food.getFat() <= 10)
            score += 3;

        food.setHealthScore(score);

        return food;
    }
}