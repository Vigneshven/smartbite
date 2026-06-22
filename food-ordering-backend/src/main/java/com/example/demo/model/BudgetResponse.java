package com.example.demo.model;

import java.util.List;

public class BudgetResponse {

    private double budget;
    private double spent;
    private double saved;
    private List<BudgetMeal> foods;

    public double getBudget() {
        return budget;
    }

    public void setBudget(double budget) {
        this.budget = budget;
    }

    public double getSpent() {
        return spent;
    }

    public void setSpent(double spent) {
        this.spent = spent;
    }

    public double getSaved() {
        return saved;
    }

    public void setSaved(double saved) {
        this.saved = saved;
    }

    public List<BudgetMeal> getFoods() {
        return foods;
    }

    public void setFoods(List<BudgetMeal> foods) {
        this.foods = foods;
    }
}