package com.example.demo.service;

import com.example.demo.dao.BudgetMealDAO;
import com.example.demo.model.BudgetMeal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import com.example.demo.model.BudgetResponse;

@Service
public class BudgetMealService {

    @Autowired
    BudgetMealDAO budgetMealDAO;

    public BudgetResponse getBudgetMeals(
        double budget) {

    List<BudgetMeal> foods =
            budgetMealDAO
                    .getMealsWithinBudget(
                            budget);

    List<BudgetMeal> result =
            new ArrayList<>();

    double total = 0;

    for(BudgetMeal food : foods) {

        if(total + food.getPrice()
                <= budget) {

            result.add(food);

            total += food.getPrice();
        }
    }

    BudgetResponse response =
            new BudgetResponse();

    response.setBudget(budget);
    response.setSpent(total);
    response.setSaved(budget - total);
    response.setFoods(result);

    return response;
   }
}