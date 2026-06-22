package com.example.demo.service;

import com.example.demo.dao.RestaurantDAO;
import com.example.demo.model.Restaurant;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RestaurantService {

    @Autowired
    private RestaurantDAO restaurantDAO;

    public List<Restaurant> getAllRestaurants() {
        return restaurantDAO.getAllRestaurants();
    }

    public Restaurant getRestaurantById(int id) {
        return restaurantDAO.getRestaurantById(id);
    }

    public List<Restaurant> searchRestaurants(
        String keyword) {

    return restaurantDAO
            .searchRestaurants(keyword);
    }
}