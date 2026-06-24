package com.example.demo.service;

import com.example.demo.dao.BudgetMealDAO;
import com.example.demo.model.BudgetMeal;
import com.example.demo.model.BudgetResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BudgetMealServiceTest {

    @Mock
    private BudgetMealDAO budgetMealDAO;

    @InjectMocks
    private BudgetMealService budgetMealService;

    @Test
    void shouldReturnMealsWithinBudgetGreedySelection() {
        when(budgetMealDAO.getMealsWithinBudget(12.00)).thenReturn(Arrays.asList(
                createMeal(1, "Salad", 3.50),
                createMeal(2, "Wrap", 4.00),
                createMeal(3, "Smoothie", 5.00),
                createMeal(4, "Soup", 6.50)));

        BudgetResponse response = budgetMealService.getBudgetMeals(12.00);

        assertThat(response.getBudget()).isEqualTo(12.00);
        assertThat(response.getSpent()).isEqualTo(11.50);
        assertThat(response.getSaved()).isEqualTo(0.50);
        assertThat(response.getFoods()).extracting("foodName")
                .containsExactly("Salad", "Wrap", "Smoothie");
    }

    private BudgetMeal createMeal(int id, String name, double price) {
        BudgetMeal meal = new BudgetMeal();
        meal.setFoodId(id);
        meal.setFoodName(name);
        meal.setPrice(price);
        return meal;
    }
}
