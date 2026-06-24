package com.example.demo.dao;

import com.example.demo.model.TopSellingFood;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class AdminDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public int countUsers() {
        String sql = "SELECT COUNT(*) FROM USERS";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public int countFoods() {
        String sql = "SELECT COUNT(*) FROM FOODS";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public int countRestaurants() {
        String sql = "SELECT COUNT(*) FROM RESTAURANTS";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public int countOrders() {
        String sql = "SELECT COUNT(*) FROM ORDERS";
        return jdbcTemplate.queryForObject(sql, Integer.class);
    }

    public double totalRevenue() {
        String sql = "SELECT NVL(SUM(TOTAL_AMOUNT), 0) FROM ORDERS";
        return jdbcTemplate.queryForObject(sql, Double.class);
    }

    public List<TopSellingFood> findTopSellingFoods(int limit) {
        String sql = "SELECT * FROM (" +
                "SELECT f.FOOD_ID, f.FOOD_NAME, r.RESTAURANT_NAME, SUM(oi.QUANTITY) AS SALES_COUNT " +
                "FROM ORDER_ITEMS oi " +
                "JOIN FOODS f ON oi.FOOD_ID = f.FOOD_ID " +
                "JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                "GROUP BY f.FOOD_ID, f.FOOD_NAME, r.RESTAURANT_NAME " +
                "ORDER BY SALES_COUNT DESC" +
                ") WHERE ROWNUM <= ?";

        return jdbcTemplate.query(
                sql,
                ps -> ps.setInt(1, limit),
                (rs, rowNum) -> {
                    TopSellingFood food = new TopSellingFood();
                    food.setFoodId(rs.getInt("FOOD_ID"));
                    food.setFoodName(rs.getString("FOOD_NAME"));
                    food.setRestaurantName(rs.getString("RESTAURANT_NAME"));
                    food.setSalesCount(rs.getInt("SALES_COUNT"));
                    return food;
                });
    }
}
