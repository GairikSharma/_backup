package com.example.ProjectProyash.sql;

public class HomeSql {
	
	private HomeSql() {
    }

    public static final String INSERT_HOME_DETAILS =
            "INSERT INTO home_details " +
            "(name, email, amount, date) " +
            "VALUES (?, ?, ?, ?)";
}
