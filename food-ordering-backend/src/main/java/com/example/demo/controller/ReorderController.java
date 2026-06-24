package com.example.demo.controller;

import com.example.demo.model.Food;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reorder")
@CrossOrigin("*")
public class ReorderController {

    @Autowired
    private OrderService orderService;

    @GetMapping("/{userId}")
    public List<Food> getReorderFoods(@PathVariable int userId) {
        return orderService.getReorderFoods(userId);
    }
}
