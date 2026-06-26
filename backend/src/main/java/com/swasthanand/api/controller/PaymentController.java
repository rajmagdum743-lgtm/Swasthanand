package com.swasthanand.api.controller;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import com.swasthanand.api.config.RazorpayConfig;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayConfig razorpayConfig;

    @PostMapping("/create-order")
    public Mono<ResponseEntity<Object>> createOrder(@RequestBody Map<String, Object> data) {
        return Mono.fromCallable(() -> {
            try {
                RazorpayClient client = new RazorpayClient(razorpayConfig.getKey().getId(),
                        razorpayConfig.getKey().getSecret());

                JSONObject orderRequest = new JSONObject();
                orderRequest.put("amount", Integer.parseInt(data.get("amount").toString()) * 100); // amount in paisa
                orderRequest.put("currency", "INR");
                orderRequest.put("receipt", "txn_" + System.currentTimeMillis());

                Order order = client.orders.create(orderRequest);
                return ResponseEntity.ok((Object) order.toString());
            } catch (RazorpayException e) {
                return ResponseEntity.internalServerError().body((Object) e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }

    @PostMapping("/verify")
    public Mono<ResponseEntity<Object>> verifyPayment(@RequestBody Map<String, String> data) {
        return Mono.fromCallable(() -> {
            String orderId = data.get("razorpay_order_id");
            String paymentId = data.get("razorpay_payment_id");
            String signature = data.get("razorpay_signature");

            try {
                JSONObject attributes = new JSONObject();
                attributes.put("razorpay_order_id", orderId);
                attributes.put("razorpay_payment_id", paymentId);
                attributes.put("razorpay_signature", signature);

                boolean isValid = Utils.verifyPaymentSignature(attributes, razorpayConfig.getKey().getSecret());

                if (isValid) {
                    return ResponseEntity.ok((Object) Map.of("status", "success", "message", "Payment verified successfully"));
                } else {
                    return ResponseEntity.badRequest().body((Object) Map.of("status", "error", "message", "Invalid signature"));
                }
            } catch (Exception e) {
                return ResponseEntity.internalServerError().body((Object) e.getMessage());
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
