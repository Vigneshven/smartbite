package com.example.demo.controller;

import com.example.demo.model.Food;
import com.example.demo.service.FoodService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

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

        @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<?> createFoodJson(@RequestBody Food food) {
                Food created = foodService.createFood(food);
                if (created != null)
                        return ResponseEntity.status(201).body(created);
                return ResponseEntity.badRequest().body("Failed to create food");
        }

        @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> createFoodMultipart(@RequestParam Map<String, String> params,
                        @RequestParam(required = false) MultipartFile image) {
                try {
                        Food food = new Food();
                        food.setFoodName(params.getOrDefault("foodName", ""));
                        food.setCategory(params.getOrDefault("category", ""));
                        String price = params.getOrDefault("price", "0");
                        food.setPrice(Double.parseDouble(price));
                        food.setDescription(params.getOrDefault("description", ""));
                        food.setIngredients(params.getOrDefault("ingredients", ""));

                        if (image != null && !image.isEmpty()) {
                                Path uploadDir = Paths.get("uploads");
                                if (!Files.exists(uploadDir))
                                        Files.createDirectories(uploadDir);
                                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                                Path out = uploadDir.resolve(filename);
                                image.transferTo(out.toFile());
                                food.setImageUrl("/uploads/" + filename);
                        }

                        Food created = foodService.createFood(food);
                        if (created != null)
                                return ResponseEntity.status(201).body(created);
                        return ResponseEntity.badRequest().body("Failed to create food");
                } catch (IOException e) {
                        return ResponseEntity.status(500).body("File save failed");
                }
        }

        @PutMapping(path = "/{foodId}", consumes = MediaType.APPLICATION_JSON_VALUE)
        public ResponseEntity<?> updateFoodJson(@PathVariable int foodId, @RequestBody Food food) {
                boolean ok = foodService.updateFood(foodId, food);
                if (ok)
                        return ResponseEntity.ok().body("Updated");
                return ResponseEntity.status(404).body("Food not found");
        }

        @PutMapping(path = "/{foodId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
        public ResponseEntity<?> updateFoodMultipart(@PathVariable int foodId,
                        @RequestParam Map<String, String> params,
                        @RequestParam(required = false) MultipartFile image) {
                try {
                        Food food = new Food();
                        food.setFoodName(params.getOrDefault("foodName", ""));
                        food.setCategory(params.getOrDefault("category", ""));
                        String price = params.getOrDefault("price", "0");
                        food.setPrice(Double.parseDouble(price));
                        food.setDescription(params.getOrDefault("description", ""));
                        food.setIngredients(params.getOrDefault("ingredients", ""));

                        if (image != null && !image.isEmpty()) {
                                Path uploadDir = Paths.get("uploads");
                                if (!Files.exists(uploadDir))
                                        Files.createDirectories(uploadDir);
                                String filename = System.currentTimeMillis() + "_" + image.getOriginalFilename();
                                Path out = uploadDir.resolve(filename);
                                image.transferTo(out.toFile());
                                food.setImageUrl("/uploads/" + filename);
                        }

                        boolean ok = foodService.updateFood(foodId, food);
                        if (ok)
                                return ResponseEntity.ok().body("Updated");
                        return ResponseEntity.status(404).body("Food not found");
                } catch (IOException e) {
                        return ResponseEntity.status(500).body("File save failed");
                }
        }

        @DeleteMapping("/{foodId}")
        public ResponseEntity<?> deleteFood(@PathVariable int foodId) {
                boolean ok = foodService.deleteFood(foodId);
                if (ok)
                        return ResponseEntity.ok().body("Deleted");
                return ResponseEntity.status(404).body("Food not found");
        }
}