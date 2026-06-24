package com.example.demo.controller;

import com.example.demo.model.AdminStats;
import com.example.demo.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/stats")
    public AdminStats getAdminStats() {
        return adminService.getAdminStats();
    }
}