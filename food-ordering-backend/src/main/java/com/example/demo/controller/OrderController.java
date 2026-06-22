package com.example.demo.controller;

import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderRequest;
import com.example.demo.model.OrderDetail;
import com.example.demo.model.OrderRequest;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin("*")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @PostMapping("/place")
    public String placeOrder(
            @RequestBody OrderRequest request) {

        return orderService.placeOrder(

                request.getUserId(),

                request.getPaymentMethod(),

                request.getDeliveryAddress()

        );
    }

    @GetMapping("/user/{userId}")
    public List<OrderHistory> getOrderHistory(
            @PathVariable int userId) {

        return orderService
                .getOrderHistory(userId);
    }

    @GetMapping("/details/{orderId}")
    public List<OrderDetail> getOrderDetails(
            @PathVariable int orderId) {

        return orderService
                .getOrderDetails(orderId);
    }
}