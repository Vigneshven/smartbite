package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import org.springframework.jdbc.datasource.DriverManagerDataSource;

@Configuration
public class DBConfig {

    @Value("${DB_URL:jdbc:mysql://localhost:3306/smartbite?createDatabaseIfNotExist=true}")
    private String url;

    @Value("${DB_USERNAME:root}")
    private String username;

    @Value("${DB_PASSWORD:root}")
    private String password;

    @Bean
    public DataSource dataSource() {
        DriverManagerDataSource ds = new DriverManagerDataSource();

        ds.setDriverClassName("com.mysql.cj.jdbc.Driver");
        ds.setUrl(url);
        ds.setUsername(username);
        ds.setPassword(password);

        return ds;
    }
}