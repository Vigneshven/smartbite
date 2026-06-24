package com.example.demo.model;

import java.util.List;

public class AdminStats {

    private int totalUsers;
    private int totalFoods;
    private int totalRestaurants;
    private int totalOrders;
    private double totalRevenue;
    private List<TopSellingFood> topSellingFoods;

    public int getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(int totalUsers) {
        this.totalUsers = totalUsers;
    }

    public int getTotalFoods() {
        return totalFoods;
    }

    public void setTotalFoods(int totalFoods) {
        this.totalFoods = totalFoods;
    }

    public int getTotalRestaurants() {
        return totalRestaurants;
    }

    public void setTotalRestaurants(int totalRestaurants) {
        this.totalRestaurants = totalRestaurants;
    }

    public int getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(int totalOrders) {
        this.totalOrders = totalOrders;
    }

    public double getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(double totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<TopSellingFood> getTopSellingFoods() {
        return topSellingFoods;
    }

    public void setTopSellingFoods(List<TopSellingFood> topSellingFoods) {
        this.topSellingFoods = topSellingFoods;
    }
}
