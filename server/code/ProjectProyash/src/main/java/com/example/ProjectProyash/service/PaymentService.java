package com.example.ProjectProyash.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashMap;
import java.util.Map;

import org.json.JSONObject;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.ProjectProyash.DTO.HomeDTO;
import com.example.ProjectProyash.service.HomeService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;

@Service
public class PaymentService {

    private final RazorpayClient razorpayClient;
    private final String razorpaySecret;
    private final HomeService homeService;

    public PaymentService(
            @Value("${razorpay.key.id}") String keyId,
            @Value("${razorpay.key.secret}") String keySecret,
            HomeService homeService)
            throws RazorpayException {

        this.razorpayClient =
                new RazorpayClient(keyId, keySecret);

        this.razorpaySecret = keySecret;
        this.homeService = homeService;
    }

    
    public Map<String, Object> createOrder(double amount)
            throws RazorpayException {

        int amountInPaise = BigDecimal.valueOf(amount)
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put(
                "receipt",
                "proyash_" + System.currentTimeMillis()
        );

        Order order =
                razorpayClient.orders.create(orderRequest);

        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "orderId",
                order.get("id").toString()
        );

        response.put(
                "amount",
                order.get("amount")
        );

        response.put(
                "currency",
                order.get("currency")
        );

        return response;
    }

    
    public Map<String, Object> verifyPaymentAndSave(
            Map<String, Object> request) throws Exception {

        /*
         * Read Razorpay response
         */
        String razorpayOrderId =
                getRequiredValue(
                        request,
                        "razorpay_order_id"
                );

        String razorpayPaymentId =
                getRequiredValue(
                        request,
                        "razorpay_payment_id"
                );

        String razorpaySignature =
                getRequiredValue(
                        request,
                        "razorpay_signature"
                );

        /*
         * Read contribution information
         */
        String name =
                getRequiredValue(request, "name");

        String email =
                getRequiredValue(request, "email");

        String date =
                getRequiredValue(request, "date");

        Object amountObject =
                request.get("amount");

        if (amountObject == null) {
            throw new IllegalArgumentException(
                    "Amount is required"
            );
        }

        double amount;

        try {

            amount =
                    Double.parseDouble(
                            amountObject.toString()
                    );

        } catch (NumberFormatException e) {

            throw new IllegalArgumentException(
                    "Invalid amount"
            );
        }

        if (amount <= 0) {

            throw new IllegalArgumentException(
                    "Amount must be greater than 0"
            );
        }

        /*
         * Razorpay signature verification
         *
         * Razorpay signs:
         *
         * razorpay_order_id + "|" +
         * razorpay_payment_id
         */
        String signatureData =
                razorpayOrderId
                        + "|"
                        + razorpayPaymentId;

        boolean signatureValid =
                Utils.verifySignature(
                        signatureData,
                        razorpaySignature,
                        razorpaySecret
                );

        if (!signatureValid) {

            throw new IllegalArgumentException(
                    "Invalid Razorpay payment signature"
            );
        }

        /*
         * Signature is valid.
         *
         * Now save contribution to PostgreSQL.
         */
        HomeDTO homeDTO = new HomeDTO();

        homeDTO.setName(name);
        homeDTO.setEmail(email);
        homeDTO.setAmount(amount);
        homeDTO.setDate(date);

        homeService.saveHomeDetails(homeDTO);

        /*
         * Send success response to Angular
         */
        Map<String, Object> response =
                new HashMap<>();

        response.put(
                "success",
                true
        );

        response.put(
                "message",
                "Payment verified and contribution recorded successfully"
        );

        response.put(
                "razorpayOrderId",
                razorpayOrderId
        );

        response.put(
                "razorpayPaymentId",
                razorpayPaymentId
        );

        return response;
    }

    /**
     * Helper method for required request fields
     */
    private String getRequiredValue(
            Map<String, Object> request,
            String key) {

        Object value = request.get(key);

        if (value == null ||
                value.toString().trim().isEmpty()) {

            throw new IllegalArgumentException(
                    key + " is required"
            );
        }

        return value.toString();
    }
}