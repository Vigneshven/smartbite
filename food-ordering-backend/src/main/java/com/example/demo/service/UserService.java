package com.example.demo.service;

import com.example.demo.dao.UserDAO;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.LoginResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.demo.security.JwtUtil;
import java.util.logging.Logger;

@Service
public class UserService {

        private static final Logger logger = Logger.getLogger(UserService.class.getName());

        @Autowired
        UserDAO userDAO;

        @Autowired
        BCryptPasswordEncoder passwordEncoder;

        @Autowired
        JwtUtil jwtUtil;

        public int register(User user) {
                logger.info("[UserService] Registering user: " + user.getEmail());
                user.setPassword(
                                passwordEncoder.encode(
                                                user.getPassword()));

                user.setRole("USER");

                return userDAO.registerUser(user);
        }

        public LoginResponse login(LoginRequest request) {
                logger.info("[UserService] Login attempt for: " + request.getEmail());

                User user = userDAO.findByEmail(
                                request.getEmail());

                if (user == null) {
                        logger.warning("[UserService] Login failed: user not found - " + request.getEmail());
                        return null;
                }

                boolean matched = passwordEncoder.matches(
                                request.getPassword(),
                                user.getPassword());

                if (matched) {
                        logger.info("[UserService] Login successful for: " + request.getEmail());

                        LoginResponse response = new LoginResponse();

                        response.setToken(
                                        jwtUtil.generateToken(
                                                        user.getEmail(),
                                                        user.getRole()));

                        response.setUserId(
                                        user.getUserId());

                        response.setFullName(
                                        user.getFullName());

                        String role = user.getRole();
                        if (role != null && role.startsWith("ROLE_")) {
                                role = role.substring(5);
                        }
                        response.setRole(role);

                        return response;
                }

                logger.warning("[UserService] Login failed: password mismatch - " + request.getEmail());
                return null;
        }

        public User getUserById(int userId) {
                logger.info("[UserService] Fetching user by ID: " + userId);
                return userDAO.getUserById(userId);
        }

        /**
         * Update user information (used for password reset and profile updates)
         */
        public void updateUser(User user) {
                logger.info("[UserService] Updating user: " + user.getEmail());

                // Encode password if it's being changed
                if (user.getPassword() != null && !user.getPassword().isEmpty()) {
                        user.setPassword(passwordEncoder.encode(user.getPassword()));
                        logger.info("[UserService] Password updated for: " + user.getEmail());
                }

                userDAO.updateUser(user);
                logger.info("[UserService] User updated successfully: " + user.getEmail());
        }

}