package com.example.demo.model;

public class WeeklySpending {

    private double totalSpent;
    private int orderCount;
    private double avgOrder;

    public double getTotalSpent() {
        return totalSpent;
    }

    public void setTotalSpent(double totalSpent) {
        this.totalSpent = totalSpent;
    }

    public int getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(int orderCount) {
        this.orderCount = orderCount;
    }

    public double getAvgOrder() {
        return avgOrder;
    }

    public void setAvgOrder(double avgOrder) {
        this.avgOrder = avgOrder;
    }
}
