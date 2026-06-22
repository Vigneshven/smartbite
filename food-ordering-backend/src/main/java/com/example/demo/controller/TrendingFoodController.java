package com.example.demo.controller;

import com.example.demo.model.TrendingFood;
import com.example.demo.service.TrendingFoodService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trending")
@CrossOrigin("*")
public class TrendingFoodController {

    @Autowired
    TrendingFoodService trendingFoodService;

    @GetMapping
    public List<TrendingFood> getTrendingFoods() {

        return trendingFoodService
                .getTrendingFoods();
    }
}