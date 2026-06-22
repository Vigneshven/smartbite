package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.service.ReviewService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {

    @Autowired
    ReviewService reviewService;

    @PostMapping
    public String addReview(
            @RequestBody Review review) {

        int result =
                reviewService
                        .addReview(review);

        return result > 0
                ? "Review Added Successfully"
                : "Failed";
    }

    @GetMapping("/restaurant/{restaurantId}")
    public List<Review> getReviews(
            @PathVariable int restaurantId) {

        return reviewService
                .getReviewsByRestaurant(
                        restaurantId);
    }

    @GetMapping("/restaurant/{restaurantId}/average")
    public Double getAverageRating(
            @PathVariable int restaurantId) {

        return reviewService
                .getAverageRating(
                        restaurantId);
    }
}