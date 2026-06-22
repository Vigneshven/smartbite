package com.example.demo.dao;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderDetail;

@Repository
public class OrderDAO {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        public double getCartTotal(int userId) {

                String sql = "SELECT NVL(SUM(f.PRICE * c.QUANTITY),0) " +
                                "FROM CART c " +
                                "JOIN FOODS f ON c.FOOD_ID = f.FOOD_ID " +
                                "WHERE c.USER_ID = ?";

                return jdbcTemplate.queryForObject(
                                sql,
                                Double.class,
                                userId);
        }

        public int createOrder(
                        int userId,
                        double totalAmount,
                        String paymentMethod,
                        String deliveryAddress) {

                String sql = "INSERT INTO ORDERS " +
                                "(ORDER_ID, USER_ID, TOTAL_AMOUNT, STATUS, PAYMENT_METHOD, DELIVERY_ADDRESS, ORDER_DATE) "
                                +
                                "VALUES " +
                                "(ORDERS_SEQ.NEXTVAL, ?, ?, ?, ?, ?, SYSDATE)";

                return jdbcTemplate.update(
                                sql,
                                userId,
                                totalAmount,
                                "PLACED",
                                paymentMethod,
                                deliveryAddress);
        }

        public int getLatestOrderId(int userId) {

                String sql = "SELECT MAX(ORDER_ID) " +
                                "FROM ORDERS " +
                                "WHERE USER_ID=?";

                Integer orderId = jdbcTemplate.queryForObject(
                                sql,
                                Integer.class,
                                userId);

                return orderId == null ? 0 : orderId;
        }

        public int createOrderItems(
                        int orderId,
                        int userId) {

                String sql = "INSERT INTO ORDER_ITEMS " +
                                "(ITEM_ID, ORDER_ID, RESTAURANT_ID, FOOD_ID, QUANTITY, PRICE) " +
                                "SELECT " +
                                "ORDER_ITEMS_SEQ.NEXTVAL, " +
                                "?, " +
                                "f.RESTAURANT_ID, " +
                                "c.FOOD_ID, " +
                                "c.QUANTITY, " +
                                "f.PRICE " +
                                "FROM CART c, FOODS f " +
                                "WHERE c.FOOD_ID = f.FOOD_ID " +
                                "AND c.USER_ID = ?";

                return jdbcTemplate.update(
                                sql,
                                orderId,
                                userId);
        }

        public int clearCart(int userId) {

                String sql = "DELETE FROM CART " +
                                "WHERE USER_ID = ?";

                return jdbcTemplate.update(
                                sql,
                                userId);
        }

        public List<OrderHistory> getOrderHistory(
                        int userId) {

                String sql = "SELECT * " +
                                "FROM ORDERS " +
                                "WHERE USER_ID = ? " +
                                "ORDER BY ORDER_DATE DESC";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {

                                        OrderHistory order = new OrderHistory();

                                        order.setOrderId(
                                                        rs.getInt("ORDER_ID"));

                                        order.setTotalAmount(
                                                        rs.getDouble("TOTAL_AMOUNT"));

                                        order.setStatus(
                                                        rs.getString("STATUS"));

                                        order.setOrderDate(
                                                        rs.getDate("ORDER_DATE"));

                                        order.setPaymentMethod(
                                                        rs.getString("PAYMENT_METHOD"));

                                        order.setDeliveryAddress(
                                                        rs.getString("DELIVERY_ADDRESS"));

                                        return order;
                                });
        }

        public List<OrderDetail> getOrderDetails(
                        int orderId) {

                String sql = "SELECT " +
                                "r.RESTAURANT_NAME, " +
                                "f.FOOD_NAME, " +
                                "f.IMAGE_URL, " +
                                "oi.QUANTITY, " +
                                "oi.PRICE, " +
                                "oi.FOOD_ID " +
                                "FROM ORDER_ITEMS oi " +
                                "JOIN FOODS f ON oi.FOOD_ID = f.FOOD_ID " +
                                "JOIN RESTAURANTS r ON oi.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE oi.ORDER_ID = ?";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { orderId },
                                (rs, rowNum) -> {

                                        OrderDetail detail = new OrderDetail();

                                        detail.setFoodId(
                                                        rs.getInt("FOOD_ID"));

                                        detail.setRestaurantName(
                                                        rs.getString("RESTAURANT_NAME"));

                                        detail.setFoodName(
                                                        rs.getString("FOOD_NAME"));

                                        detail.setImageUrl(
                                                        rs.getString("IMAGE_URL"));

                                        detail.setQuantity(
                                                        rs.getInt("QUANTITY"));

                                        detail.setPrice(
                                                        rs.getDouble("PRICE"));

                                        return detail;
                                });
        }
}