package com.swasthanand.api.service;

import com.swasthanand.api.model.User;
import com.swasthanand.api.repository.UserRepository;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public Mono<User> findByPhone(String phone) {
        return userRepository.findByPhone(phone)
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    public Mono<User> findById(String id) {
        return userRepository.findById(id)
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    public Flux<User> findAll() {
        return userRepository.findAll()
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    public Mono<User> registerUser(User user) {
        // Set default role if not provided
        if (user.getRole() == null) {
            user.setRole(User.Role.CUSTOMER);
        }
        
        // Ensure first address uploaded is set as default if any
        if (user.getAddresses() != null && !user.getAddresses().isEmpty()) {
            user.getAddresses().get(0).setDefault(true);
            if (user.getAddresses().get(0).getLabel() == null) {
                user.getAddresses().get(0).setLabel("Home");
            }
        }
        
        user.serializeAddresses();
        return userRepository.save(user)
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    public Mono<User> updateUser(User user) {
        user.setNew(false);
        user.serializeAddresses();
        return userRepository.save(user)
                .map(u -> {
                    u.deserializeAddresses();
                    return u;
                });
    }

    public Mono<Void> deleteById(String id) {
        return userRepository.deleteById(id);
    }

    public Mono<Void> deleteByPhone(String phone) {
        return userRepository.deleteByPhone(phone);
    }
}
