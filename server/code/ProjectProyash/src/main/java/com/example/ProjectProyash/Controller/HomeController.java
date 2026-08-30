package com.example.ProjectProyash.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProjectProyash.DTO.HomeDTO;
import com.example.ProjectProyash.service.HomeService;

@RestController
@RequestMapping("/api/proyash")
@CrossOrigin(
        origins = "http://localhost:4200",
        allowedHeaders = "*",
        methods = {
                RequestMethod.GET,
                RequestMethod.POST,
                RequestMethod.PUT,
                RequestMethod.DELETE,
                RequestMethod.OPTIONS
        }
)
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
    public ResponseEntity<String> saveHomeDetails(
            @RequestBody HomeDTO homeDto) {

        homeService.saveHomeDetails(homeDto);

        return ResponseEntity.ok("Data saved successfully");
    }
}