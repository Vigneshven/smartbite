package com.example.demo.dao;

import com.example.demo.model.Recommendation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RecommendationDAO {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        public String getFavoriteCategory(int userId) {

                String sql = "SELECT CATEGORY FROM (" +
                                " SELECT f.CATEGORY, COUNT(*) TOTAL " +
                                " FROM ORDER_ITEMS oi " +
                                " JOIN FOODS f ON oi.FOOD_ID = f.FOOD_ID " +
                                " JOIN ORDERS o ON oi.ORDER_ID = o.ORDER_ID " +
                                " WHERE o.USER_ID = ? " +
                                " GROUP BY f.CATEGORY " +
                                " ORDER BY TOTAL DESC" +
                                ") WHERE ROWNUM = 1";

                return jdbcTemplate.queryForObject(
                                sql,
                                String.class,
                                userId);
        }

        public List<Recommendation> getRecommendations(
                        String category,
                        int userId) {

                String sql = "SELECT * " +
                                "FROM FOODS f " +
                                "WHERE f.CATEGORY = ? " +
                                "AND NOT EXISTS (" +
                                " SELECT 1 " +
                                " FROM ORDER_ITEMS oi " +
                                " JOIN ORDERS o ON oi.ORDER_ID = o.ORDER_ID " +
                                " WHERE o.USER_ID = ? " +
                                " AND oi.FOOD_ID = f.FOOD_ID" +
                                ") " +
                                "AND ROWNUM <= 5";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { category, userId },
                                (rs, rowNum) -> {

                                        Recommendation food = new Recommendation();

                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setCategory(rs.getString("CATEGORY"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setRestaurantId(
                                                        rs.getInt("RESTAURANT_ID"));

                                        return food;
                                });
        }
}