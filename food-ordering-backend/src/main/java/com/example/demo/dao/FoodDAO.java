package com.example.demo.dao;

import com.example.demo.model.Food;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.*;

@Repository
public class FoodDAO {

        @Autowired
        JdbcTemplate jdbcTemplate;

        public List<Food> getFoodsByRestaurant(
                        int restaurantId) {

                String sql = "SELECT * FROM FOODS WHERE RESTAURANT_ID = ?";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { restaurantId },
                                (rs, rowNum) -> {

                                        Food food = new Food();

                                        food.setFoodId(
                                                        rs.getInt("FOOD_ID"));

                                        food.setRestaurantId(
                                                        rs.getInt("RESTAURANT_ID"));

                                        food.setFoodName(
                                                        rs.getString("FOOD_NAME"));

                                        food.setCategory(
                                                        rs.getString("CATEGORY"));

                                        food.setPrice(
                                                        rs.getDouble("PRICE"));

                                        food.setDescription(
                                                        rs.getString("DESCRIPTION"));

                                        food.setCalories(
                                                        rs.getInt("CALORIES"));

                                        food.setStock(
                                                        rs.getInt("STOCK"));

                                        food.setImageUrl(
                                                        rs.getString("IMAGE_URL"));
                                        food.setIngredients(
                                                        rs.getString("INGREDIENTS"));

                                        return food;
                                });
        }

        public List<Food> searchFoods(
                        String keyword) {

                String sql = "SELECT * FROM FOODS " +
                                "WHERE LOWER(FOOD_NAME) LIKE LOWER(?) " +
                                "OR LOWER(CATEGORY) LIKE LOWER(?)";

                String searchValue = "%" + keyword + "%";

                return jdbcTemplate.query(
                                sql,
                                ps -> {
                                        ps.setString(1, searchValue);
                                        ps.setString(2, searchValue);
                                },
                                (rs, rowNum) -> {

                                        Food food = new Food();

                                        food.setFoodId(
                                                        rs.getInt("FOOD_ID"));

                                        food.setFoodName(
                                                        rs.getString("FOOD_NAME"));

                                        food.setCategory(
                                                        rs.getString("CATEGORY"));

                                        food.setPrice(
                                                        rs.getDouble("PRICE"));

                                        food.setDescription(
                                                        rs.getString("DESCRIPTION"));

                                        food.setIngredients(
                                                        rs.getString("INGREDIENTS"));

                                        return food;
                                });
        }

        public List<Food> filterFoods(
                        String category,
                        Double maxPrice,
                        Integer minCalories,
                        Integer maxCalories) {

                StringBuilder sql = new StringBuilder(
                                "SELECT * FROM FOODS WHERE 1=1");

                List<Object> params = new ArrayList<>();

                if (category != null) {
                        sql.append(
                                        " AND LOWER(CATEGORY) = LOWER(?)");
                        params.add(category);
                }

                if (maxPrice != null) {
                        sql.append(
                                        " AND PRICE <= ?");
                        params.add(maxPrice);
                }

                if (minCalories != null) {
                        sql.append(
                                        " AND CALORIES >= ?");
                        params.add(minCalories);
                }

                if (maxCalories != null) {
                        sql.append(
                                        " AND CALORIES <= ?");
                        params.add(maxCalories);
                }

                return jdbcTemplate.query(
                                sql.toString(),
                                params.toArray(),
                                (rs, rowNum) -> {

                                        Food food = new Food();

                                        food.setFoodId(
                                                        rs.getInt("FOOD_ID"));

                                        food.setFoodName(
                                                        rs.getString("FOOD_NAME"));

                                        food.setCategory(
                                                        rs.getString("CATEGORY"));

                                        food.setPrice(
                                                        rs.getDouble("PRICE"));

                                        food.setCalories(
                                                        rs.getInt("CALORIES"));

                                        food.setIngredients(
                                                        rs.getString("INGREDIENTS"));

                                        return food;
                                });
        }

        public List<Food> getMostLikedFoods() {

                String sql = "SELECT f.FOOD_ID, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.INGREDIENTS, r.RESTAURANT_NAME, COUNT(fav.FOOD_ID) AS LIKE_COUNT "
                                +
                                "FROM FOODS f " +
                                "LEFT JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "LEFT JOIN FAVORITES fav ON f.FOOD_ID = fav.FOOD_ID " +
                                "GROUP BY f.FOOD_ID, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.INGREDIENTS, r.RESTAURANT_NAME "
                                +
                                "ORDER BY LIKE_COUNT DESC " +
                                "LIMIT 5";

                return jdbcTemplate.query(sql, (rs, rowNum) -> {

                        Food food = new Food();

                        food.setFoodId(rs.getInt("FOOD_ID"));
                        food.setFoodName(rs.getString("FOOD_NAME"));
                        food.setCategory(rs.getString("CATEGORY"));
                        food.setPrice(rs.getDouble("PRICE"));
                        food.setIngredients(rs.getString("INGREDIENTS"));
                        food.setRestaurantName(rs.getString("RESTAURANT_NAME"));

                        return food;
                });
        }

        public Food getFoodById(int foodId) {

                String sql = "SELECT * FROM FOODS WHERE FOOD_ID=?";

                return jdbcTemplate.queryForObject(

                                sql,

                                new Object[] { foodId },

                                (rs, rowNum) -> {

                                        Food food = new Food();

                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setDescription(rs.getString("DESCRIPTION"));
                                        food.setCategory(rs.getString("CATEGORY"));
                                        food.setCalories(rs.getInt("CALORIES"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setIngredients(rs.getString("INGREDIENTS"));

                                        return food;
                                });
        }

        public List<Food> getFoodsByCategory(String category) {

                String sql = "SELECT f.FOOD_ID, f.RESTAURANT_ID, r.RESTAURANT_NAME, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.DESCRIPTION, f.CALORIES, f.STOCK, f.IMAGE_URL, f.INGREDIENTS "
                                +
                                "FROM FOODS f " +
                                "LEFT JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE LOWER(f.CATEGORY) = LOWER(?) " +
                                "LIMIT 12";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { category },
                                (rs, rowNum) -> {

                                        Food food = new Food();

                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setRestaurantId(rs.getInt("RESTAURANT_ID"));
                                        food.setRestaurantName(rs.getString("RESTAURANT_NAME"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setCategory(rs.getString("CATEGORY"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setDescription(rs.getString("DESCRIPTION"));
                                        food.setCalories(rs.getInt("CALORIES"));
                                        food.setStock(rs.getInt("STOCK"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setIngredients(rs.getString("INGREDIENTS"));

                                        return food;
                                });
        }

}
