package com.example.demo.service;

import com.example.demo.dao.AdminDAO;
import com.example.demo.model.AdminStats;
import com.example.demo.model.TopSellingFood;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    @Autowired
    private AdminDAO adminDAO;

    public AdminStats getAdminStats() {
        AdminStats stats = new AdminStats();

        stats.setTotalUsers(adminDAO.countUsers());
        stats.setTotalFoods(adminDAO.countFoods());
        stats.setTotalRestaurants(adminDAO.countRestaurants());
        stats.setTotalOrders(adminDAO.countOrders());
        stats.setTotalRevenue(adminDAO.totalRevenue());
        stats.setTopSellingFoods(adminDAO.findTopSellingFoods(5));

        return stats;
    }
}
