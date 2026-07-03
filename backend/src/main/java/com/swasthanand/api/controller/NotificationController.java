package com.swasthanand.api.controller;

import com.swasthanand.api.model.ProductNotification;
import com.swasthanand.api.repository.ProductNotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {
    
    private final ProductNotificationRepository notificationRepository;

    @PostMapping
    public Mono<ResponseEntity<ProductNotification>> subscribe(@RequestBody ProductNotification notification) {
        return notificationRepository.save(notification)
                .map(ResponseEntity::ok);
    }
}
