package com.example.demo.dao;

import com.example.demo.model.Favorite;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import com.example.demo.model.Food;
import java.util.List;

@Repository
public class FavoriteDAO {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public int addFavorite(Favorite favorite) {

        String sql = "INSERT INTO FAVORITES " +
                "(FAVORITE_ID, USER_ID, FOOD_ID) " +
                "VALUES " +
                "(FAVORITES_SEQ.NEXTVAL, ?, ?)";

        return jdbcTemplate.update(
                sql,
                favorite.getUserId(),
                favorite.getFoodId());
    }

    public List<Food> getFavorites(int userId) {

        String sql = "SELECT " +
                "f.FOOD_ID, " +
                "f.FOOD_NAME, " +
                "f.CATEGORY, " +
                "f.PRICE, " +
                "f.IMAGE_URL, " +
                "r.RESTAURANT_NAME " +
                "FROM FAVORITES fav " +
                "JOIN FOODS f ON fav.FOOD_ID = f.FOOD_ID " +
                "JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                "WHERE fav.USER_ID = ?";

        return jdbcTemplate.query(
                sql,
                new Object[] { userId },
                (rs, rowNum) -> {

                    Food food = new Food();

                    food.setFoodId(rs.getInt("FOOD_ID"));
                    food.setFoodName(rs.getString("FOOD_NAME"));
                    food.setCategory(rs.getString("CATEGORY"));
                    food.setPrice(rs.getDouble("PRICE"));
                    food.setImageUrl(rs.getString("IMAGE_URL"));
                    food.setRestaurantName(rs.getString("RESTAURANT_NAME"));

                    return food;
                });
    }

    public List<Food> getWishlistRecommendations(int userId) {
        String categorySql = "SELECT CATEGORY FROM (" +
                " SELECT f.CATEGORY, COUNT(*) TOTAL " +
                " FROM FAVORITES fav " +
                " JOIN FOODS f ON fav.FOOD_ID = f.FOOD_ID " +
                " WHERE fav.USER_ID = ? " +
                " GROUP BY f.CATEGORY " +
                " ORDER BY TOTAL DESC" +
                ") WHERE ROWNUM = 1";

        List<String> categories = jdbcTemplate.query(
                categorySql,
                new Object[] { userId },
                (rs, rowNum) -> rs.getString("CATEGORY"));

        if (categories.isEmpty() || categories.get(0) == null || categories.get(0).isBlank()) {
            return List.of();
        }

        String category = categories.get(0);

        String sql = "SELECT f.FOOD_ID, f.FOOD_NAME, f.CATEGORY, f.PRICE, f.IMAGE_URL, r.RESTAURANT_NAME " +
                "FROM FOODS f " +
                "JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                "WHERE LOWER(f.CATEGORY) = LOWER(?) " +
                "AND f.FOOD_ID NOT IN (SELECT FOOD_ID FROM FAVORITES WHERE USER_ID = ?) " +
                "AND ROWNUM <= 6";

        return jdbcTemplate.query(
                sql,
                new Object[] { category, userId },
                (rs, rowNum) -> {
                    Food food = new Food();
                    food.setFoodId(rs.getInt("FOOD_ID"));
                    food.setFoodName(rs.getString("FOOD_NAME"));
                    food.setCategory(rs.getString("CATEGORY"));
                    food.setPrice(rs.getDouble("PRICE"));
                    food.setImageUrl(rs.getString("IMAGE_URL"));
                    food.setRestaurantName(rs.getString("RESTAURANT_NAME"));
                    return food;
                });
    }

    public boolean exists(int userId, int foodId) {

        String sql = "SELECT COUNT(*) FROM FAVORITES WHERE USER_ID=? AND FOOD_ID=?";

        Integer count = jdbcTemplate.queryForObject(
                sql,
                new Object[] { userId, foodId },
                Integer.class);

        return count != null && count > 0;
    }

    public int removeFavorite(int favoriteId) {

        String sql = "DELETE FROM FAVORITES WHERE FAVORITE_ID = ?";

        return jdbcTemplate.update(sql, favoriteId);
    }

    public int removeByUserAndFood(int userId, int foodId) {

        String sql = "DELETE FROM FAVORITES WHERE USER_ID=? AND FOOD_ID=?";

        return jdbcTemplate.update(sql, userId, foodId);
    }

    public List<Food> getMostLikedFoods() {

        String sql = "SELECT * FROM (" +
                "SELECT f.FOOD_ID, f.FOOD_NAME, f.PRICE, f.IMAGE_URL, COUNT(fav.FOOD_ID) AS LIKE_COUNT " +
                "FROM FOODS f " +
                "LEFT JOIN FAVORITES fav ON f.FOOD_ID = fav.FOOD_ID " +
                "GROUP BY f.FOOD_ID, f.FOOD_NAME, f.PRICE, f.IMAGE_URL " +
                "ORDER BY LIKE_COUNT DESC) WHERE ROWNUM <= 5";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            Food food = new Food();
            food.setFoodId(rs.getInt("FOOD_ID"));
            food.setFoodName(rs.getString("FOOD_NAME"));
            food.setLikeCount(rs.getInt("LIKE_COUNT"));
            food.setPrice(rs.getDouble("PRICE"));
            food.setImageUrl(rs.getString("IMAGE_URL"));
            return food;
        });
    }
}