package com.example.demo.dao;

import com.example.demo.model.Food;
import com.example.demo.model.OrderDetail;
import com.example.demo.model.OrderHistory;
import com.example.demo.model.OrderStatusResponse;
import com.example.demo.model.TopRestaurantResponse;
import com.example.demo.model.WeeklySpending;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;

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

        public OrderStatusResponse getOrderStatus(int orderId) {
                String sql = "SELECT STATUS FROM ORDERS WHERE ORDER_ID = ?";

                return jdbcTemplate.queryForObject(
                                sql,
                                new Object[] { orderId },
                                (rs, rowNum) -> {
                                        OrderStatusResponse response = new OrderStatusResponse();
                                        response.setStatus(rs.getString("STATUS"));
                                        return response;
                                });
        }

        public WeeklySpending getWeeklySpending(int userId) {
                String sql = "SELECT NVL(SUM(TOTAL_AMOUNT),0) AS TOTAL_SPENT, " +
                                "COUNT(*) AS ORDER_COUNT, " +
                                "NVL(ROUND(AVG(TOTAL_AMOUNT),2),0) AS AVG_ORDER " +
                                "FROM ORDERS " +
                                "WHERE USER_ID = ? " +
                                "AND ORDER_DATE >= SYSDATE - 7";

                return jdbcTemplate.queryForObject(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {
                                        WeeklySpending stats = new WeeklySpending();
                                        stats.setTotalSpent(rs.getDouble("TOTAL_SPENT"));
                                        stats.setOrderCount(rs.getInt("ORDER_COUNT"));
                                        stats.setAvgOrder(rs.getDouble("AVG_ORDER"));
                                        return stats;
                                });
        }

        public TopRestaurantResponse getTopRestaurant(int userId) {
                String sql = "SELECT * FROM (" +
                                "SELECT r.RESTAURANT_NAME, r.ADDRESS, NVL(r.RATING,0) AS RATING, COUNT(*) AS ORDER_COUNT "
                                +
                                "FROM ORDERS o " +
                                "JOIN ORDER_ITEMS oi ON o.ORDER_ID = oi.ORDER_ID " +
                                "JOIN RESTAURANTS r ON oi.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE o.USER_ID = ? " +
                                "GROUP BY r.RESTAURANT_NAME, r.ADDRESS, r.RATING " +
                                "ORDER BY COUNT(*) DESC) WHERE ROWNUM = 1";

                List<TopRestaurantResponse> results = jdbcTemplate.query(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {
                                        TopRestaurantResponse restaurant = new TopRestaurantResponse();
                                        restaurant.setRestaurantName(rs.getString("RESTAURANT_NAME"));
                                        restaurant.setLocation(rs.getString("ADDRESS"));
                                        restaurant.setRating(rs.getDouble("RATING"));
                                        restaurant.setOrderCount(rs.getInt("ORDER_COUNT"));
                                        return restaurant;
                                });

                return results.isEmpty() ? null : results.get(0);
        }

        public List<Food> getReorderFoods(int userId) {
                String sql = "SELECT f.FOOD_ID, f.FOOD_NAME, f.PRICE, f.IMAGE_URL, r.RESTAURANT_NAME " +
                                "FROM ORDER_ITEMS oi " +
                                "JOIN FOODS f ON oi.FOOD_ID = f.FOOD_ID " +
                                "JOIN RESTAURANTS r ON oi.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE oi.ORDER_ID = (SELECT MAX(ORDER_ID) FROM ORDERS WHERE USER_ID = ?) " +
                                "AND ROWNUM <= 6";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {
                                        Food food = new Food();
                                        food.setFoodId(rs.getInt("FOOD_ID"));
                                        food.setFoodName(rs.getString("FOOD_NAME"));
                                        food.setPrice(rs.getDouble("PRICE"));
                                        food.setImageUrl(rs.getString("IMAGE_URL"));
                                        food.setRestaurantName(rs.getString("RESTAURANT_NAME"));
                                        return food;
                                });
        }
}