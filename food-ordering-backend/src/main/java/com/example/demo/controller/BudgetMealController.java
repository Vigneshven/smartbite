package com.example.demo.controller;

import com.example.demo.service.BudgetMealService;
import com.example.demo.model.BudgetResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/budget")
@CrossOrigin("*")
public class BudgetMealController {

    @Autowired
    BudgetMealService budgetMealService;

    @GetMapping("/{amount}")
    public BudgetResponse getMeals(
        @PathVariable double amount) {

        return budgetMealService
                .getBudgetMeals(amount);
    }
}