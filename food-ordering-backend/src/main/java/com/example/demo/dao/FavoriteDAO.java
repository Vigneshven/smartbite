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
                "f.PRICE, " +
                "f.IMAGE_URL " +
                "FROM FAVORITES fav " +
                "JOIN FOODS f ON fav.FOOD_ID = f.FOOD_ID " +
                "WHERE fav.USER_ID = ?";

        return jdbcTemplate.query(
                sql,
                new Object[] { userId },
                (rs, rowNum) -> {

                    Food food = new Food();

                    food.setFoodId(rs.getInt("FOOD_ID"));
                    food.setFoodName(rs.getString("FOOD_NAME"));
                    food.setPrice(rs.getDouble("PRICE"));
                    food.setImageUrl(rs.getString("IMAGE_URL"));

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

        String sql = "SELECT " +
                "f.FOOD_ID, " +
                "f.FOOD_NAME, " +
                "f.PRICE, " +
                "f.IMAGE_URL, " +
                "COUNT(fav.FOOD_ID) AS LIKE_COUNT " +
                "FROM FOODS f " +
                "LEFT JOIN FAVORITES fav ON f.FOOD_ID = fav.FOOD_ID " +
                "GROUP BY " +
                "f.FOOD_ID, " +
                "f.FOOD_NAME, " +
                "f.PRICE, " +
                "f.IMAGE_URL " +
                "ORDER BY LIKE_COUNT DESC FETCH FIRST 5 ROWS ONLY";

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