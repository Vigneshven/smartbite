package com.example.demo.service;

import com.example.demo.dao.RecommendationDAO;
import com.example.demo.model.Recommendation;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RecommendationService {

    @Autowired
    private RecommendationDAO recommendationDAO;

    public List<Recommendation> getRecommendations(
            int userId) {

        String category =
                recommendationDAO
                        .getFavoriteCategory(userId);

        return recommendationDAO
                .getRecommendations(
                        category,
                        userId);
    }
}