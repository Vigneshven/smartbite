package com.example.demo.controller;

import com.example.demo.model.Food;
import com.example.demo.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wishlist")
@CrossOrigin("*")
public class WishlistController {

    @Autowired
    private FavoriteService favoriteService;

    @GetMapping("/recommendations/{userId}")
    public List<Food> getWishlistRecommendations(@PathVariable int userId) {
        return favoriteService.getWishlistRecommendations(userId);
    }
}
