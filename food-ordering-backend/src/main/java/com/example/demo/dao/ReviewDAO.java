package com.example.demo.dao;

import com.example.demo.model.Review;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Repository
public class ReviewDAO {

        @Autowired
        JdbcTemplate jdbcTemplate;

        private static final String UPLOAD_DIR = "src/main/resources/uploads/reviews/";

        public int addReview(Review review) {

                String sql = "INSERT INTO REVIEWS " +
                                "(USER_ID, RESTAURANT_ID, RATING, REVIEW_TEXT, PHOTO_URL) " +
                                "VALUES (?, ?, ?, ?, ?)";

                return jdbcTemplate.update(
                                sql,
                                review.getUserId(),
                                review.getRestaurantId(),
                                review.getRating(),
                                review.getComment(),
                                review.getPhotoUrl());
        }

        public String savePhotoFile(byte[] fileData, String fileName) throws IOException {
                File uploadDir = new File(UPLOAD_DIR);
                if (!uploadDir.exists()) {
                        uploadDir.mkdirs();
                }

                String fileNameWithTimestamp = System.currentTimeMillis() + "_" + fileName;
                Path filePath = Paths.get(UPLOAD_DIR, fileNameWithTimestamp);
                Files.write(filePath, fileData);

                return "/uploads/reviews/" + fileNameWithTimestamp;
        }

        public List<Review> getReviewsByRestaurant(
                        int restaurantId) {

                String sql = "SELECT r.REVIEW_ID, r.USER_ID, r.RESTAURANT_ID, r.RATING, r.REVIEW_TEXT, r.PHOTO_URL, u.FULL_NAME AS USER_NAME "
                                +
                                "FROM REVIEWS r " +
                                "LEFT JOIN USERS u ON r.USER_ID = u.USER_ID " +
                                "WHERE r.RESTAURANT_ID = ? " +
                                "ORDER BY r.REVIEW_ID DESC";

                return jdbcTemplate.query(
                                sql,
                                ps -> ps.setInt(1, restaurantId),
                                (rs, rowNum) -> {

                                        Review review = new Review();

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

                                        review.setUserName(
                                                        rs.getString("USER_NAME"));

                                        review.setPhotoUrl(
                                                        rs.getString("PHOTO_URL"));

                                        return review;
                                });
        }

        public Double getAverageRating(int restaurantId) {

                String sql = "SELECT AVG(RATING) " +
                                "FROM REVIEWS " +
                                "WHERE RESTAURANT_ID = ?";

                Double avg = jdbcTemplate.queryForObject(
                                sql,
                                Double.class,
                                restaurantId);

                return avg == null ? 0.0 : avg;
        }
}