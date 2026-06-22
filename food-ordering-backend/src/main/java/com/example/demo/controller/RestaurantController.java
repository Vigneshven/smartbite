package com.example.demo.controller;

import com.example.demo.model.Restaurant;
import com.example.demo.service.RestaurantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/restaurants")
@CrossOrigin(origins = "*")
public class RestaurantController {

    @Autowired
    private RestaurantService restaurantService;

    @GetMapping
    public List<Restaurant> getAllRestaurants() {

        return restaurantService.getAllRestaurants();

    }

    @GetMapping("/{id}")
    public Restaurant getRestaurantById(
    @PathVariable int id) {

      return restaurantService
            .getRestaurantById(id);

    }

    @GetMapping("/search")
    public List<Restaurant> searchRestaurants(
        @RequestParam String keyword) {

    return restaurantService
            .searchRestaurants(keyword);
    }
}