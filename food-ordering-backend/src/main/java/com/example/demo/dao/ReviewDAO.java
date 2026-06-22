package com.example.demo.dao;

import com.example.demo.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class ReviewDAO {

    @Autowired
    JdbcTemplate jdbcTemplate;

    public int addReview(Review review) {

        String sql =
            "INSERT INTO REVIEWS " +
            "(REVIEW_ID, USER_ID, RESTAURANT_ID, RATING, REVIEW_TEXT) " +
            "VALUES (REVIEWS_SEQ.NEXTVAL, ?, ?, ?, ?)";

        return jdbcTemplate.update(
                sql,
                review.getUserId(),
                review.getRestaurantId(),
                review.getRating(),
                review.getComment()
        );
    }

    public List<Review> getReviewsByRestaurant(
            int restaurantId) {

        String sql =
            "SELECT * FROM REVIEWS " +
            "WHERE RESTAURANT_ID = ?";

        return jdbcTemplate.query(
                sql,
                ps -> ps.setInt(1, restaurantId),
                (rs, rowNum) -> {

                    Review review =
                            new Review();

                    review.setReviewId(
                            rs.getInt("REVIEW_ID"));

                    review.setUserId(
                            rs.getInt("USER_ID"));

                    review.setRestaurantId(
                            rs.getInt("RESTAURANT_ID"));

                    review.setRating(
                            rs.getInt("RATING"));

                    review.setComment(
                            rs.getString("REVIEW_TEXT"));

                    return review;
                });
    }

    public Double getAverageRating(int restaurantId) {

    String sql =
        "SELECT AVG(RATING) " +
        "FROM REVIEWS " +
        "WHERE RESTAURANT_ID = ?";

    return jdbcTemplate.queryForObject(
            sql,
            Double.class,
            restaurantId);
    }
}