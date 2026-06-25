package com.example.demo.dao;

import com.example.demo.model.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.util.List;
import com.example.demo.model.CartItem;

@Repository
public class CartDAO {

        @Autowired
        private JdbcTemplate jdbcTemplate;

        public int addToCart(Cart cart) {

                String checkSql = "SELECT COUNT(*) FROM CART " +
                                "WHERE USER_ID=? AND FOOD_ID=?";

                Integer count = jdbcTemplate.queryForObject(

                                checkSql,

                                Integer.class,

                                cart.getUserId(),
                                cart.getFoodId());

                if (count != null && count > 0) {

                        String updateSql = "UPDATE CART " +
                                        "SET QUANTITY = QUANTITY + ? " +
                                        "WHERE USER_ID=? AND FOOD_ID=?";

                        return jdbcTemplate.update(

                                        updateSql,

                                        cart.getQuantity(),

                                        cart.getUserId(),

                                        cart.getFoodId());
                }

                String insertSql = "INSERT INTO CART " +
                                "(USER_ID, FOOD_ID, QUANTITY) " +
                                "VALUES(?, ?, ?)";

                return jdbcTemplate.update(

                                insertSql,

                                cart.getUserId(),

                                cart.getFoodId(),

                                cart.getQuantity());
        }

        public List<CartItem> getCartItems(int userId) {

                String sql = "SELECT " +
                                "c.CART_ID, " +
                                "c.FOOD_ID, " +
                                "f.FOOD_NAME, " +
                                "r.RESTAURANT_NAME, " +
                                "f.PRICE, " +
                                "f.IMAGE_URL, " +
                                "c.QUANTITY " +
                                "FROM CART c " +
                                "JOIN FOODS f ON c.FOOD_ID = f.FOOD_ID " +
                                "JOIN RESTAURANTS r ON f.RESTAURANT_ID = r.RESTAURANT_ID " +
                                "WHERE c.USER_ID = ?";

                return jdbcTemplate.query(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {

                                        CartItem item = new CartItem();

                                        item.setCartId(
                                                        rs.getInt("CART_ID"));

                                        item.setFoodId(
                                                        rs.getInt("FOOD_ID"));

                                        item.setImageUrl(
                                                        rs.getString("IMAGE_URL"));

                                        item.setFoodName(
                                                        rs.getString("FOOD_NAME"));

                                        item.setRestaurantName(
                                                        rs.getString("RESTAURANT_NAME"));

                                        item.setPrice(
                                                        rs.getDouble("PRICE"));

                                        item.setQuantity(
                                                        rs.getInt("QUANTITY"));

                                        item.setItemTotal(
                                                        rs.getDouble("PRICE")
                                                                        *
                                                                        rs.getInt("QUANTITY"));

                                        return item;
                                });
        }

        public int removeCartItem(int cartId) {

                String sql = "DELETE FROM CART WHERE CART_ID = ?";

                return jdbcTemplate.update(
                                sql,
                                cartId);
        }

        public int updateQuantity(
                        Cart cart) {

                String sql = "UPDATE CART " +
                                "SET QUANTITY = ? " +
                                "WHERE CART_ID = ?";

                return jdbcTemplate.update(
                                sql,
                                cart.getQuantity(),
                                cart.getCartId());
        }
}