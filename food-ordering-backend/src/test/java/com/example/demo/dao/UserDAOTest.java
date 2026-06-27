package com.example.demo.dao;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserDAOTest {

    @Mock
    private JdbcTemplate jdbcTemplate;

    @InjectMocks
    private UserDAO userDAO;

    @Test
    void shouldNormalizeEmailBeforeLookup() {
        when(jdbcTemplate.queryForObject(anyString(), any(Object[].class), any(RowMapper.class)))
                .thenThrow(new EmptyResultDataAccessException(1));

        userDAO.findByEmail("  Test@Example.com  ");

        ArgumentCaptor<Object[]> argsCaptor = ArgumentCaptor.forClass(Object[].class);
        verify(jdbcTemplate).queryForObject(anyString(), argsCaptor.capture(), any(RowMapper.class));
        assertThat(argsCaptor.getValue()[0]).isEqualTo("test@example.com");
    }
}
