package com.example.demo.dao;

import com.example.demo.model.BudgetMeal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class BudgetMealDAO {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public List<BudgetMeal> getMealsWithinBudget(
            double budget) {

        String sql =
            "SELECT FOOD_ID, FOOD_NAME, PRICE " +
            "FROM FOODS " +
            "WHERE PRICE <= ? " +
            "ORDER BY PRICE";

        return jdbcTemplate.query(
            sql,
            new Object[]{budget},
            (rs, rowNum) -> {

                BudgetMeal meal =
                        new BudgetMeal();

                meal.setFoodId(
                        rs.getInt("FOOD_ID"));

                meal.setFoodName(
                        rs.getString("FOOD_NAME"));

                meal.setPrice(
                        rs.getDouble("PRICE"));

                return meal;
            });
    }
}