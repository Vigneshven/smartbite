package com.example.demo.dao;

import com.example.demo.model.HealthScore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class HealthScoreDAO {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public HealthScore getFoodNutrition(int foodId) {

        String sql =
            "SELECT FOOD_NAME, CALORIES, PROTEIN, FAT " +
            "FROM FOODS " +
            "WHERE FOOD_ID = ?";

        return jdbcTemplate.queryForObject(
            sql,
            new Object[]{foodId},
            (rs, rowNum) -> {

                HealthScore food =
                        new HealthScore();

                food.setFoodName(
                        rs.getString("FOOD_NAME"));

                food.setCalories(
                        rs.getInt("CALORIES"));

                food.setProtein(
                        rs.getInt("PROTEIN"));

                food.setFat(
                        rs.getInt("FAT"));

                return food;
            });
    }
}