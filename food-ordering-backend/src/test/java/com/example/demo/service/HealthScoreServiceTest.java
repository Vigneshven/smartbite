package com.example.demo.service;

import com.example.demo.dao.HealthScoreDAO;
import com.example.demo.model.HealthScore;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HealthScoreServiceTest {

    @Mock
    private HealthScoreDAO healthScoreDAO;

    @InjectMocks
    private HealthScoreService healthScoreService;

    @Test
    void shouldCalculateHealthScore() {
        HealthScore food = new HealthScore();
        food.setFoodName("Grilled Chicken");
        food.setCalories(280);
        food.setProtein(20);
        food.setFat(8);

        when(healthScoreDAO.getFoodNutrition(7)).thenReturn(food);

        HealthScore result = healthScoreService.calculateScore(7);

        assertThat(result.getFoodName()).isEqualTo("Grilled Chicken");
        assertThat(result.getHealthScore()).isEqualTo(10);
    }

    @Test
    void shouldReturnNotFoundWhenFoodDoesNotExist() {
        when(healthScoreDAO.getFoodNutrition(999))
                .thenThrow(new EmptyResultDataAccessException(1));

        assertThatThrownBy(() -> healthScoreService.calculateScore(999))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Food not found");
    }
}
