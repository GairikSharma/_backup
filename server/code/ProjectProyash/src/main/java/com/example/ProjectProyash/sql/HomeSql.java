package com.example.ProjectProyash.sql;

public class HomeSql {
	
	private HomeSql() {
    }

    public static final String INSERT_HOME_DETAILS =
            "INSERT INTO backup_data " +
            "(name, email, amount, date) " +
            "VALUES (?, ?, ?, ?)";
}
