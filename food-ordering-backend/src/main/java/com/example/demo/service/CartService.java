package com.example.demo.service;

import com.example.demo.dao.CartDAO;
import com.example.demo.model.Cart;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import com.example.demo.model.CartItem;

@Service
public class CartService {

    @Autowired
    private CartDAO cartDAO;

    public int addToCart(Cart cart) {
        return cartDAO.addToCart(cart);
    }

    public List<CartItem> getCartItems(int userId) {

    return cartDAO.getCartItems(userId);

    }

    public int removeCartItem(int cartId) {

    return cartDAO.removeCartItem(cartId);

    }

    public int updateQuantity(
        Cart cart) {

    return cartDAO
            .updateQuantity(cart);
    }
}