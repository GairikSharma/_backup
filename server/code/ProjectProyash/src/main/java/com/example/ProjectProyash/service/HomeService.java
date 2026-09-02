package com.example.ProjectProyash.service;

import java.sql.Date;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import com.example.ProjectProyash.DTO.HomeDTO;
import com.example.ProjectProyash.sql.HomeSql;

@Service
public class HomeService {

    private final JdbcTemplate jdbcTemplate;

    public HomeService(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public int saveHomeDetails(HomeDTO homeDto) {

        return jdbcTemplate.update(
                HomeSql.INSERT_HOME_DETAILS,
                homeDto.getName(),
                homeDto.getEmail(),
                homeDto.getAmount(),
                Date.valueOf(homeDto.getDate())
        );
    }
}