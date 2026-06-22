package com.example.demo.service;

import com.example.demo.dao.UserDAO;
import com.example.demo.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.model.LoginRequest;
import com.example.demo.model.LoginResponse;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.example.demo.security.JwtUtil;

@Service
public class UserService {

    @Autowired
    UserDAO userDAO;

    @Autowired
    BCryptPasswordEncoder passwordEncoder;

    @Autowired
    JwtUtil jwtUtil;

    public int register(User user) {

        user.setPassword(
                passwordEncoder.encode(
                        user.getPassword()
                )
        );

        user.setRole("USER");

        return userDAO.registerUser(user);
    }

    public LoginResponse login(LoginRequest request) {

    User user =
            userDAO.findByEmail(
                    request.getEmail());

    if(user == null) {
        return null;
    }

    boolean matched =
            passwordEncoder.matches(
                    request.getPassword(),
                    user.getPassword());

    if(matched) {

        LoginResponse response =
                new LoginResponse();

        response.setToken(
                jwtUtil.generateToken(
                        user.getEmail(),
                        user.getRole()));

        response.setUserId(
                user.getUserId());

        response.setFullName(
                user.getFullName());

        return response;
    }

    return null;
   }

   public User getUserById(int userId) {
    return userDAO.getUserById(userId);
   }
}