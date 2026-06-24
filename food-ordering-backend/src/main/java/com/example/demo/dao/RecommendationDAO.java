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

                List<String> categories = jdbcTemplate.query(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> rs.getString("CATEGORY"));

                return categories.isEmpty() ? null : categories.get(0);
        }

        public List<Recommendation> getRecommendations(
                        String category,
                        int userId) {

                if (category == null || category.isBlank()) {
                        return getPopularRecommendations(userId);
                }

                String sql = "SELECT f.FOOD_ID, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.IMAGE_URL, f.RESTAURANT_ID, r.RESTAURANT_NAME "
                                +
                                "FROM FOODS f " +
                                "LEFT JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE f.CATEGORY = ? " +
                                "AND NOT EXISTS (" +
                                " SELECT 1 " +
                                " FROM ORDER_ITEMS oi " +
                                " JOIN ORDERS o ON oi.ORDER_ID = o.ORDER_ID " +
                                " WHERE o.USER_ID = ? " +
                                " AND oi.FOOD_ID = f.FOOD_ID" +
                                ") " +
                                "AND ROWNUM <= 5";

                List<Recommendation> recommendations = jdbcTemplate.query(
                                sql,
                                new Object[] { category, userId },
                                (rs, rowNum) -> {

                                        Recommendation food = new Recommendation();

                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setCategory(rs.getString("CATEGORY"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setRestaurantId(rs.getInt("RESTAURANT_ID"));
                                        food.setRestaurantName(rs.getString("RESTAURANT_NAME"));

                                        return food;
                                });

                return recommendations.isEmpty()
                                ? getPopularRecommendations(userId)
                                : recommendations;
        }

        public List<Recommendation> getPopularRecommendations(int userId) {
                String sql = "SELECT f.FOOD_ID, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.IMAGE_URL, f.RESTAURANT_ID, r.RESTAURANT_NAME "
                                +
                                "FROM FOODS f " +
                                "LEFT JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE ROWNUM <= 5";

                return jdbcTemplate.query(
                                sql,
                                (rs, rowNum) -> {
                                        Recommendation food = new Recommendation();

                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setCategory(rs.getString("CATEGORY"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setRestaurantId(rs.getInt("RESTAURANT_ID"));
                                        food.setRestaurantName(rs.getString("RESTAURANT_NAME"));

                                        return food;
                                });
        }
}