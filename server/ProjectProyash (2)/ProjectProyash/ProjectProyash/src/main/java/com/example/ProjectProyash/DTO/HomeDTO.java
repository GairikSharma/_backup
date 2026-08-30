package com.example.ProjectProyash.DTO;


import java.math.BigDecimal;
import java.time.LocalDate;

public class HomeDTO {
	  private String name;
	    private String email;
	    private BigDecimal amount;
	    private LocalDate date;

	    public HomeDTO() {
	    }

	    public HomeDTO(String name, String email, BigDecimal amount, LocalDate date) {
	        this.name = name;
	        this.email = email;
	        this.amount = amount;
	        this.date = date;
	    }

	    public String getName() {
	        return name;
	    }

	    public void setName(String name) {
	        this.name = name;
	    }

	    public String getEmail() {
	        return email;
	    }

	    public void setEmail(String email) {
	        this.email = email;
	    }

	    public BigDecimal getAmount() {
	        return amount;
	    }

	    public void setAmount(BigDecimal amount) {
	        this.amount = amount;
	    }

	    public LocalDate getDate() {
	        return date;
	    }

	    public void setDate(LocalDate date) {
	        this.date = date;
	    }
}
