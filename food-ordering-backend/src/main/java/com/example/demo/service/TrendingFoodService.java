package com.example.demo.service;

import com.example.demo.dao.TrendingFoodDAO;
import com.example.demo.model.TrendingFood;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TrendingFoodService {

    @Autowired
    TrendingFoodDAO trendingFoodDAO;

    public List<TrendingFood> getTrendingFoods() {

        return trendingFoodDAO
                .getTrendingFoods();
    }
}