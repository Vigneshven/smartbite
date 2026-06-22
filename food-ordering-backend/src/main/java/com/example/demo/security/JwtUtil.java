package com.example.demo.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import org.springframework.stereotype.Component;

@Component
public class JwtUtil {

    private static final String SECRET =
            "mySecretKeyForFoodOrderingApplication123456789";

    private final Key key =
            Keys.hmacShaKeyFor(
                    SECRET.getBytes(
                            StandardCharsets.UTF_8));

    public String generateToken(
        String email,
        String role) {

    return Jwts.builder()
            .subject(email)
            .claim("role", role)
            .issuedAt(new Date())
            .expiration(
                    new Date(
                            System.currentTimeMillis()
                            + 86400000))
            .signWith(key)
            .compact();
    }

    public String extractEmail(
        String token) {

    return Jwts.parser()
            .verifyWith((javax.crypto.SecretKey) key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .getSubject();
    }

    public boolean validateToken(
        String token) {

    try {

        extractEmail(token);

        return true;

    } catch(Exception e) {

        return false;
    }
    }

    public String extractRole(
        String token) {

    return Jwts.parser()
            .verifyWith(
                (javax.crypto.SecretKey) key)
            .build()
            .parseSignedClaims(token)
            .getPayload()
            .get("role", String.class);
    }
    
}