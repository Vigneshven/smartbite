package com.example.demo.service;

import com.example.demo.dao.FavoriteDAO;
import com.example.demo.model.Favorite;
import com.example.demo.model.Food;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FavoriteService {

    @Autowired
    FavoriteDAO favoriteDAO;

    public int addFavorite(
            Favorite favorite) {

        return favoriteDAO
                .addFavorite(favorite);
    }

    public List<Food> getFavorites(int userId) {
    return favoriteDAO.getFavorites(userId);
    }

    public int removeFavorite(int id) {
    return favoriteDAO.removeFavorite(id);
    }

    public boolean exists(int userId, int foodId) {
    return favoriteDAO.exists(userId, foodId);
    }

    public String toggleFavorite(Favorite favorite) {

    boolean exists = favoriteDAO.exists(
            favorite.getUserId(),
            favorite.getFoodId()
    );

    if (exists) {
        favoriteDAO.removeByUserAndFood(
                favorite.getUserId(),
                favorite.getFoodId()
        );
        return "Removed";
    } else {
        favoriteDAO.addFavorite(favorite);
        return "Added";
    }
    }

    public int removeByUserAndFood(int userId, int foodId) {
    return favoriteDAO.removeByUserAndFood(userId, foodId);
    }
}