package com.example.demo.controller;

import com.example.demo.model.Favorite;
import com.example.demo.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.Food;
import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin("*")
public class FavoriteController {

    @Autowired
    FavoriteService favoriteService;

    @PostMapping("/add")
    public String addFavorite(
            @RequestBody Favorite favorite) {

        int result =
                favoriteService
                        .addFavorite(
                                favorite);

        if(result > 0) {
            return "Added To Favorites";
        }

        return "Failed";
    }

    @PostMapping("/toggle")
    public String toggleFavorite(@RequestBody Favorite favorite) {
    return favoriteService.toggleFavorite(favorite);
    }

    @GetMapping("/{userId}")
    public List<Food> getFavorites(@PathVariable int userId) {
    return favoriteService.getFavorites(userId);
    }

    @DeleteMapping("/remove")
    public String removeFavorite(
        @RequestParam int userId,
        @RequestParam int foodId) {

    int result = favoriteService.removeByUserAndFood(userId, foodId);
    return result > 0 ? "Removed" : "Failed";
    }

    @GetMapping("/exists")
    public boolean isFavorite(
        @RequestParam int userId,
        @RequestParam int foodId) {

    return favoriteService.exists(userId, foodId);
    }
}