package com.example.demo.controller;

import com.example.demo.model.OrderDetail;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderRequest;
import com.example.demo.model.OrderStatusResponse;
import com.example.demo.model.TopRestaurantResponse;
import com.example.demo.model.WeeklySpending;
import com.example.demo.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;

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

        @GetMapping("/status/{orderId}")
        public OrderStatusResponse getOrderStatus(
                        @PathVariable int orderId) {

                return orderService.getOrderStatus(orderId);
        }

        @GetMapping("/weekly-spending/{userId}")
        public WeeklySpending getWeeklySpending(
                        @PathVariable int userId) {

                return orderService.getWeeklySpending(userId);
        }

        @GetMapping("/top-restaurant/{userId}")
        public TopRestaurantResponse getTopRestaurant(
                        @PathVariable int userId) {

                return orderService.getTopRestaurant(userId);
        }
}
