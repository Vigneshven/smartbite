package com.example.demo.controller;

import com.example.demo.model.Cart;
import com.example.demo.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import com.example.demo.model.CartItem;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin("*")
public class CartController {

    @Autowired
    private CartService cartService;

    @PostMapping("/add")
    public String addToCart(@RequestBody Cart cart) {

        System.out.println("INSIDE ADD TO CART");

        System.out.println("USER_ID = " + cart.getUserId());
        System.out.println("FOOD_ID = " + cart.getFoodId());
        System.out.println("QUANTITY = " + cart.getQuantity());

        int result = cartService.addToCart(cart);

        System.out.println("RESULT = " + result);

        if (result > 0) {
            return "Added To Cart";
        }

        return "Failed";
    }

    @GetMapping("/user/{userId}")
    public List<CartItem> getCartItems(
            @PathVariable int userId) {

        return cartService.getCartItems(userId);

    }

    @DeleteMapping("/{cartId}")
    public String removeCartItem(
            @PathVariable int cartId) {

        int result = cartService.removeCartItem(cartId);

        if (result > 0) {
            return "Item Removed";
        }

        return "Item Not Found";
    }

    @PutMapping("/update")
    public String updateQuantity(
            @RequestBody Cart cart) {

        int result = cartService.updateQuantity(cart);

        if (result > 0) {
            return "Quantity Updated";
        }

        return "Update Failed";
    }

}