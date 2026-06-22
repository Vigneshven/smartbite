package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.LoginResponse;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    UserService userService;

    @PostMapping("/register")
    public String register(@RequestBody User user) {

        int result = userService.register(user);

        if (result > 0) {
            return "User Registered Successfully";
        } else {
            return "Registration Failed";
        }
    }

    @PostMapping("/login")
    public LoginResponse login(
        @RequestBody LoginRequest request) {

    return userService.login(request);
    }

    @GetMapping("/user/{userId}")
    public User getUser(
        @PathVariable int userId) {

    return userService.getUserById(userId);
    }
}