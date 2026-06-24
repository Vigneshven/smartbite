package com.example.demo.service;

import com.example.demo.dao.OrderDAO;
import com.example.demo.model.Food;
import com.example.demo.model.OrderDetail;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderStatusResponse;
import com.example.demo.model.TopRestaurantResponse;
import com.example.demo.model.WeeklySpending;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderDAO orderDAO;

    public String placeOrder(
            int userId,
            String paymentMethod,
            String deliveryAddress) {

        try {

            double total = orderDAO.getCartTotal(userId);

            if (total == 0) {
                return "Cart Empty";
            }

            orderDAO.createOrder(
                    userId,
                    total,
                    paymentMethod,
                    deliveryAddress);

            int orderId = orderDAO.getLatestOrderId(userId);

            orderDAO.createOrderItems(orderId, userId);

            orderDAO.clearCart(userId);

            return "Order Placed Successfully";

        } catch (Exception e) {

            e.printStackTrace();

            return e.getMessage();
        }
    }

    public List<OrderHistory> getOrderHistory(
            int userId) {

        return orderDAO.getOrderHistory(
                userId);
    }

    public List<OrderDetail> getOrderDetails(
            int orderId) {

        return orderDAO.getOrderDetails(
                orderId);
    }

    public OrderStatusResponse getOrderStatus(
            int orderId) {

        return orderDAO.getOrderStatus(orderId);
    }

    public WeeklySpending getWeeklySpending(
            int userId) {

        return orderDAO.getWeeklySpending(userId);
    }

    public TopRestaurantResponse getTopRestaurant(
            int userId) {

        return orderDAO.getTopRestaurant(userId);
    }

    public List<Food> getReorderFoods(int userId) {
        return orderDAO.getReorderFoods(userId);
    }

}