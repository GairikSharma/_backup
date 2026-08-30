package com.example.ProjectProyash.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class DatabaseConnectionChecker implements CommandLineRunner {

	private final JdbcTemplate jdbcTemplate;

	public DatabaseConnectionChecker(JdbcTemplate jdbcTemplate) {
		this.jdbcTemplate = jdbcTemplate;
	}

	@Override
	public void run(String... args) {

		try {
			Integer result = jdbcTemplate.queryForObject("SELECT 1", Integer.class);

			if (result != null && result == 1) {
				System.out.println("========================================");
				System.out.println("DATABASE CONNECTION: SUCCESS");
				System.out.println("Connected to Supabase PostgreSQL");
				System.out.println("========================================");
			}

		} catch (Exception e) {

			System.out.println("========================================");
			System.out.println("DATABASE CONNECTION: FAILED");
			System.out.println("Could not connect to Supabase PostgreSQL");
			System.out.println("Error: " + e.getMessage());
			System.out.println("========================================");
		}
	}
}