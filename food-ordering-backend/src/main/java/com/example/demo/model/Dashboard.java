package com.example.demo.model;

import java.util.List;

public class Dashboard {

    private List<Food> favoriteFoods;
    private List<Food> recommendations;
    private List<Food> recentOrders;

    public List<Food> getFavoriteFoods() {
        return favoriteFoods;
    }

    public void setFavoriteFoods(List<Food> favoriteFoods) {
        this.favoriteFoods = favoriteFoods;
    }

    public List<Food> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<Food> recommendations) {
        this.recommendations = recommendations;
    }

    public List<Food> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<Food> recentOrders) {
        this.recentOrders = recentOrders;
    }
}