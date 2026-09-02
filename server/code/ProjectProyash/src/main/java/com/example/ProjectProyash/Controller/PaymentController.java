package com.example.ProjectProyash.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import com.example.ProjectProyash.service.PaymentService;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(
    origins = {"http://localhost:4200", "https://proyash-version-1.netlify.app/"},
    allowedHeaders = "*",
    methods = {
        RequestMethod.GET,
        RequestMethod.POST,
        RequestMethod.PUT,
        RequestMethod.DELETE,
        RequestMethod.OPTIONS
    }
)
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    
    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> request) {

        try {

            Object amountObject = request.get("amount");

            if (amountObject == null) {
                return ResponseEntity.badRequest()
                        .body("Amount is required");
            }

            double amount = Double.parseDouble(
                    amountObject.toString()
            );

            if (amount <= 0) {
                return ResponseEntity.badRequest()
                        .body("Amount must be greater than 0");
            }

            return ResponseEntity.ok(
                    paymentService.createOrder(amount)
            );

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("Unable to create Razorpay order");
        }
    }

    
    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody Map<String, Object> request) {

        try {

            Map<String, Object> result =
                    paymentService.verifyPaymentAndSave(request);

            return ResponseEntity.ok(result);

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(e.getMessage());

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity.internalServerError()
                    .body("Payment verification failed");
        }
    }
}