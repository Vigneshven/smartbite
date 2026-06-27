package com.example.demo.dao;

import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.Locale;
import java.util.logging.Logger;

@Repository
public class UserDAO {

        private static final Logger logger = Logger.getLogger(UserDAO.class.getName());

        @Autowired
        JdbcTemplate jdbcTemplate;

        public int registerUser(User user) {
                String normalizedEmail = normalizeEmail(user.getEmail());
                if (normalizedEmail != null) {
                        user.setEmail(normalizedEmail);
                }

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
                String normalizedEmail = normalizeEmail(email);
                if (normalizedEmail == null) {
                        return null;
                }

                String sql = "SELECT * FROM USERS WHERE LOWER(EMAIL) = LOWER(?)";

                try {

                        return jdbcTemplate.queryForObject(
                                        sql,
                                        new Object[] { normalizedEmail },
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

        private String normalizeEmail(String email) {
                if (email == null) {
                        return null;
                }
                return email.trim().toLowerCase(Locale.ROOT);
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

        /**
         * Update user information (used for password reset and profile updates)
         */
        public int updateUser(User user) {
                logger.info("[UserDAO] Updating user: " + user.getEmail());

                String sql = "UPDATE USERS SET FULL_NAME = ?, PASSWORD = ?, PHONE = ?, ROLE = ? " +
                                "WHERE USER_ID = ?";

                try {
                        int rowsAffected = jdbcTemplate.update(
                                        sql,
                                        user.getFullName(),
                                        user.getPassword(),
                                        user.getPhone(),
                                        user.getRole(),
                                        user.getUserId());

                        logger.info("[UserDAO] Update successful for " + user.getEmail() + ". Rows affected: "
                                        + rowsAffected);
                        return rowsAffected;

                } catch (Exception e) {
                        logger.severe("[UserDAO] Failed to update user: " + user.getEmail() + ". Error: "
                                        + e.getMessage());
                        e.printStackTrace();
                        return 0;
                }
        }
}