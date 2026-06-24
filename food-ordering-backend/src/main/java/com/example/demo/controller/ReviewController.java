package com.example.demo.controller;

import com.example.demo.model.Review;
import com.example.demo.service.ReviewService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.io.IOException;

@RestController
@RequestMapping("/api/reviews")
@CrossOrigin("*")
public class ReviewController {

        @Autowired
        ReviewService reviewService;

        @PostMapping(consumes = { "multipart/form-data" })
        public ResponseEntity<String> addReview(
                        @RequestParam("userId") int userId,
                        @RequestParam("restaurantId") int restaurantId,
                        @RequestParam("rating") int rating,
                        @RequestParam("comment") String comment,
                        @RequestParam(value = "photo", required = false) MultipartFile photo) {

                try {
                        String photoUrl = null;
                        if (photo != null && !photo.isEmpty()) {
                                photoUrl = reviewService.savePhotoFile(
                                                photo.getBytes(),
                                                photo.getOriginalFilename());
                        }

                        Review review = new Review();
                        review.setUserId(userId);
                        review.setRestaurantId(restaurantId);
                        review.setRating(rating);
                        review.setComment(comment);
                        review.setPhotoUrl(photoUrl);

                        int result = reviewService.addReview(review);

                        return result > 0
                                        ? ResponseEntity.status(HttpStatus.CREATED).body("Review Added Successfully")
                                        : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                                        .body("Failed to add review");
                } catch (IOException e) {
                        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                        .body("Failed to process photo: " + e.getMessage());
                }
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