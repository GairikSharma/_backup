package com.example.ProjectProyash.Controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProjectProyash.DTO.HomeDTO;
import com.example.ProjectProyash.service.HomeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/proyash")
@CrossOrigin(origins = "${FRONTEND_URL:http://localhost:4200}")
public class HomeController {

	private final HomeService homeService;

	public HomeController(HomeService homeService) {
		this.homeService = homeService;
	}

	@GetMapping("/health")
	public String healthCheck() {
		return "OK";
	}

	@PostMapping("/save")
	public ResponseEntity<String> saveHomeDetails(@RequestBody HomeDTO homeDto) {

		homeService.saveHomeDetails(homeDto);

		return ResponseEntity.ok("Data saved successfully");
	}
}
