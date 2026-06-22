package com.example.demo.service;

import com.example.demo.dao.OrderDAO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderDetail;

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

}