package com.example.demo.controller;

import com.example.demo.model.Dashboard;
import com.example.demo.service.DashboardService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin("*")
public class DashboardController {

    @Autowired
    DashboardService dashboardService;

    @GetMapping("/{userId}")
    public Dashboard getDashboard(
            @PathVariable int userId) {

        return dashboardService
                .getDashboard(userId);
    }
}