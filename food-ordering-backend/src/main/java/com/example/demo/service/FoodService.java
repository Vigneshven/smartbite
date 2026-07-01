package com.example.demo.service;

import com.example.demo.dao.FoodDAO;
import com.example.demo.model.Food;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FoodService {

    @Autowired
    FoodDAO foodDAO;

    public List<Food> getFoodsByRestaurant(
            int restaurantId) {

        return foodDAO
                .getFoodsByRestaurant(
                        restaurantId);
    }

    public List<Food> searchFoods(
            String keyword) {

        return foodDAO
                .searchFoods(keyword);
    }

    public List<Food> filterFoods(
            String category,
            Double maxPrice,
            Integer minCalories,
            Integer maxCalories) {

        return foodDAO.filterFoods(
                category,
                maxPrice,
                minCalories,
                maxCalories);
    }

    public List<Food> getTrendingFoods() {
        return foodDAO.getMostLikedFoods();
    }

    public Food getFoodById(int foodId) {

        return foodDAO.getFoodById(foodId);

    }

    public List<Food> getFoodsByCategory(String category) {
        return foodDAO.getFoodsByCategory(category);
    }

    public Food createFood(Food food) {
        int id = foodDAO.createFood(food);
        if (id > 0) {
            return foodDAO.getFoodById(id);
        }
        return null;
    }

    public boolean updateFood(int foodId, Food food) {
        return foodDAO.updateFood(foodId, food);
    }

    public boolean deleteFood(int foodId) {
        return foodDAO.deleteFood(foodId);
    }

}
