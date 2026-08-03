package com.swasthanand.api.repository;

import com.swasthanand.api.model.User;
import org.springframework.data.r2dbc.repository.R2dbcRepository;
import reactor.core.publisher.Mono;

public interface UserRepository extends R2dbcRepository<User, String> {
    Mono<User> findByPhone(String phone);
    Mono<Void> deleteByPhone(String phone);
}
