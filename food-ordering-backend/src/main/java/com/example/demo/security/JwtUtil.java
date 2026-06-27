package com.example.demo.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Arrays;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String DEFAULT_DEV_JWT_SECRET = "dev-jwt-secret-32-chars-long-123456";

    @Autowired
    private Environment environment;

    @Value("${jwt.secret:}")
    private String jwtSecret;

    private Key key;

    @PostConstruct
    public void init() {
        if (jwtSecret == null || jwtSecret.isBlank()) {
            if (Arrays.asList(environment.getActiveProfiles()).contains("dev")) {
                jwtSecret = DEFAULT_DEV_JWT_SECRET;
            } else {
                throw new IllegalStateException("JWT secret is not configured. Set jwt.secret environment variable.");
            }
        }

        byte[] jwtKeyBytes = jwtSecret.getBytes(StandardCharsets.UTF_8);
        if (jwtKeyBytes.length < 32) {
            jwtKeyBytes = hashSecret(jwtSecret);
        }

        key = Keys.hmacShaKeyFor(jwtKeyBytes);
    }

    private byte[] hashSecret(String secret) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return digest.digest(secret.getBytes(StandardCharsets.UTF_8));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("Unable to initialize JWT key derivation.", e);
        }
    }

    public String generateToken(
            String email,
            String role) {

        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(key)
                .compact();
    }

    public String extractEmail(
            String token) {

        return parseClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateToken(
            String token) {

        try {

            parseClaims(token);

            return true;

        } catch (Exception e) {

            return false;
        }
    }

    public String extractRole(
            String token) {

        return parseClaims(token)
                .getPayload()
                .get("role", String.class);
    }

    private Jws<Claims> parseClaims(String token) {
        return Jwts.parser()
                .verifyWith((SecretKey) key)
                .build()
                .parseSignedClaims(token);
    }
}