package com.example.demo.dao;

import com.example.demo.model.Restaurant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class RestaurantDAO {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<Restaurant> getAllRestaurants() {

        String sql = "SELECT * FROM RESTAURANTS";

        return jdbcTemplate.query(sql, (rs, rowNum) -> {

            Restaurant restaurant = new Restaurant();

            restaurant.setRestaurantId(
                    rs.getInt("RESTAURANT_ID"));

            restaurant.setRestaurantName(
                    rs.getString("RESTAURANT_NAME"));

            restaurant.setCuisine(
                    rs.getString("CUISINE"));

            restaurant.setAddress(
                    rs.getString("ADDRESS"));

            restaurant.setPhone(
                    rs.getString("PHONE"));

            restaurant.setImageUrl(
                    rs.getString("IMAGE_URL"));

            restaurant.setRating(
                    rs.getDouble("RATING"));

            return restaurant;
        });
    }

    public Restaurant getRestaurantById(int restaurantId) {

    String sql =
            "SELECT * FROM RESTAURANTS WHERE RESTAURANT_ID = ?";

    return jdbcTemplate.queryForObject(
            sql,
            new Object[]{restaurantId},
            (rs, rowNum) -> {

                Restaurant r = new Restaurant();

                r.setRestaurantId(
                        rs.getInt("RESTAURANT_ID"));

                r.setRestaurantName(
                        rs.getString("RESTAURANT_NAME"));

                r.setCuisine(
                        rs.getString("CUISINE"));

                r.setAddress(
                        rs.getString("ADDRESS"));

                r.setPhone(
                        rs.getString("PHONE"));

                r.setRating(
                        rs.getDouble("RATING"));

                return r;
            });
   }

   public List<Restaurant> searchRestaurants(
        String keyword) {

    String sql =
        "SELECT * FROM RESTAURANTS " +
        "WHERE LOWER(RESTAURANT_NAME) LIKE LOWER(?) " +
        "OR LOWER(CUISINE) LIKE LOWER(?)";

    String searchValue =
            "%" + keyword + "%";

    return jdbcTemplate.query(
            sql,
            ps -> {
                ps.setString(1, searchValue);
                ps.setString(2, searchValue);
            },
            (rs, rowNum) -> {

                Restaurant restaurant =
                        new Restaurant();

                restaurant.setRestaurantId(
                        rs.getInt("RESTAURANT_ID"));

                restaurant.setRestaurantName(
                        rs.getString("RESTAURANT_NAME"));

                restaurant.setCuisine(
                        rs.getString("CUISINE"));

                restaurant.setRating(
                        rs.getDouble("RATING"));

                return restaurant;
            });
        }
}