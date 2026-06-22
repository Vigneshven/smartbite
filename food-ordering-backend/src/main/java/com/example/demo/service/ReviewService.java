package com.example.demo.service;

import com.example.demo.dao.ReviewDAO;
import com.example.demo.model.Review;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewService {

    @Autowired
    ReviewDAO reviewDAO;

    public int addReview(
            Review review) {

        return reviewDAO
                .addReview(review);
    }

    public List<Review> getReviewsByRestaurant(
            int restaurantId) {

        return reviewDAO
                .getReviewsByRestaurant(
                        restaurantId);
    }

    public Double getAverageRating(
            int restaurantId) {

        return reviewDAO
                .getAverageRating(
                        restaurantId);
    }
}