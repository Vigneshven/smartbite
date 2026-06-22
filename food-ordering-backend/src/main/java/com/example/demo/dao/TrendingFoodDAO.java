package com.example.demo.dao;

import com.example.demo.model.TrendingFood;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class TrendingFoodDAO {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public List<TrendingFood> getTrendingFoods() {

        String sql = "SELECT " +
                "f.FOOD_NAME, " +
                "f.IMAGE_URL, " +
                "f.PRICE, " +
                "COUNT(*) TOTAL_ORDERS " +
                "FROM ORDER_ITEMS oi " +
                "JOIN FOODS f " +
                "ON oi.FOOD_ID = f.FOOD_ID " +
                "GROUP BY " +
                "f.FOOD_NAME, f.IMAGE_URL, f.PRICE " +
                "ORDER BY TOTAL_ORDERS DESC";

        return jdbcTemplate.query(
                sql,
                (rs, rowNum) -> {

                    TrendingFood food = new TrendingFood();

                    food.setFoodName(
                            rs.getString("FOOD_NAME"));

                    food.setImageUrl(
                            rs.getString("IMAGE_URL"));

                    food.setPrice(
                            rs.getDouble("PRICE"));

                    food.setTotalOrders(
                            rs.getInt("TOTAL_ORDERS"));

                    return food;
                });
    }
}