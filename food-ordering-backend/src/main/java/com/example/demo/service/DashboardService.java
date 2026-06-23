package com.example.demo.service;

import com.example.demo.dao.FavoriteDAO;
import com.example.demo.model.Dashboard;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class DashboardService {

        @Autowired
        FavoriteDAO favoriteDAO;

        @Autowired
        RecommendationService recommendationService;

        @Autowired
        OrderService orderService;

        public Dashboard getDashboard(int userId) {

                Dashboard dashboard = new Dashboard();

                dashboard.setFavoriteFoods(
                                favoriteDAO.getFavorites(userId));
                dashboard.setRecommendations(
                                favoriteDAO.getFavorites(userId));

                dashboard.setRecentOrders(
                                favoriteDAO.getFavorites(userId));

                return dashboard;
        }
}