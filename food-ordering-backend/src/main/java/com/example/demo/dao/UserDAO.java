package com.example.demo.dao;

import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {

        @Autowired
        JdbcTemplate jdbcTemplate;

        public int registerUser(User user) {

                String sql = "INSERT INTO USERS " +
                                "(FULL_NAME, EMAIL, PASSWORD, PHONE, ROLE) " +
                                "VALUES " +
                                "(?, ?, ?, ?, ?)";

                return jdbcTemplate.update(
                                sql,
                                user.getFullName(),
                                user.getEmail(),
                                user.getPassword(),
                                user.getPhone(),
                                user.getRole());
        }

        public User findByEmail(String email) {

                String sql = "SELECT * FROM USERS " +
                                "WHERE EMAIL = ?";

                try {

                        return jdbcTemplate.queryForObject(
                                        sql,
                                        new Object[] { email },
                                        (rs, rowNum) -> {

                                                User user = new User();

                                                user.setUserId(
                                                                rs.getInt("USER_ID"));

                                                user.setFullName(
                                                                rs.getString("FULL_NAME"));

                                                user.setEmail(
                                                                rs.getString("EMAIL"));

                                                user.setPassword(
                                                                rs.getString("PASSWORD"));

                                                user.setPhone(
                                                                rs.getString("PHONE"));

                                                user.setRole(
                                                                rs.getString("ROLE"));

                                                return user;
                                        });

                } catch (Exception e) {
                        return null;
                }
        }

        public User getUserById(int userId) {

                String sql = "SELECT * FROM USERS WHERE USER_ID = ?";

                return jdbcTemplate.queryForObject(
                                sql,
                                new Object[] { userId },
                                (rs, rowNum) -> {

                                        User user = new User();

                                        user.setUserId(rs.getInt("USER_ID"));
                                        user.setFullName(rs.getString("FULL_NAME"));
                                        user.setEmail(rs.getString("EMAIL"));
                                        user.setPhone(rs.getString("PHONE"));
                                        user.setRole(rs.getString("ROLE"));

                                        return user;
                                });
        }
}