package com.example.demo.controller;

import com.example.demo.model.Food;
import com.example.demo.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/foods")
@CrossOrigin("*")
public class FoodController {

        @Autowired
        FoodService foodService;

        @GetMapping("/restaurant/{restaurantId}")
        public List<Food> getFoodsByRestaurant(
                        @PathVariable int restaurantId) {

                return foodService
                                .getFoodsByRestaurant(
                                                restaurantId);
        }

        @GetMapping("/search")
        public List<Food> searchFoods(
                        @RequestParam String keyword) {

                return foodService
                                .searchFoods(keyword);
        }

        @GetMapping("/filter")
        public List<Food> filterFoods(

                        @RequestParam(required = false) String category,

                        @RequestParam(required = false) Double maxPrice,

                        @RequestParam(required = false) Integer minCalories,

                        @RequestParam(required = false) Integer maxCalories) {

                return foodService.filterFoods(
                                category,
                                maxPrice,
                                minCalories,
                                maxCalories);
        }

        @GetMapping("/trending")
        public List<Food> getTrendingFoods() {
                return foodService.getTrendingFoods();
        }

        @GetMapping("/category/{category}")
        public List<Food> getFoodsByCategory(
                        @PathVariable String category) {

                return foodService.getFoodsByCategory(category);
        }

        @GetMapping("/{foodId}")
        public Food getFoodById(
                        @PathVariable int foodId) {

                return foodService.getFoodById(foodId);
        }
}