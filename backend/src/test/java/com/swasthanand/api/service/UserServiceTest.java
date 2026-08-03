package com.swasthanand.api.service;

import com.swasthanand.api.model.User;
import com.swasthanand.api.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;
import java.util.ArrayList;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    private UserService userService;
    private User sampleUser;

    @BeforeEach
    public void setUp() {
        userService = new UserService(userRepository);
        sampleUser = User.builder()
                .id("user-123")
                .phone("9876543210")
                .name("Test User")
                .role(User.Role.CUSTOMER)
                .isApproved(true)
                .addresses(new ArrayList<>())
                .build();
    }

    @Test
    public void testFindByPhone() {
        when(userRepository.findByPhone("9876543210")).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(userService.findByPhone("9876543210"))
                .expectNextMatches(u -> u.getName().equals("Test User"))
                .verifyComplete();
    }

    @Test
    public void testFindById() {
        when(userRepository.findById("user-123")).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(userService.findById("user-123"))
                .expectNextMatches(u -> u.getPhone().equals("9876543210"))
                .verifyComplete();
    }

    @Test
    public void testFindAll() {
        when(userRepository.findAll()).thenReturn(Flux.just(sampleUser));

        StepVerifier.create(userService.findAll())
                .expectNextMatches(u -> u.getId().equals("user-123"))
                .verifyComplete();
    }

    @Test
    public void testRegisterUser() {
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(userService.registerUser(sampleUser))
                .expectNextMatches(u -> u.getRole() == User.Role.CUSTOMER)
                .verifyComplete();
    }

    @Test
    public void testRegisterUser_WithAddressesAndNullRole() {
        User.Address addr = User.Address.builder()
                .pincode("10001")
                .state("NY")
                .district("New York")
                .isDefault(false)
                .build();
        User userWithoutRole = User.builder()
                .name("No Role User")
                .addresses(new ArrayList<>(java.util.List.of(addr)))
                .build();
        
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> Mono.just(invocation.getArgument(0)));

        StepVerifier.create(userService.registerUser(userWithoutRole))
                .expectNextMatches(u -> u.getRole() == User.Role.CUSTOMER && 
                                        u.getAddresses().get(0).isDefault() && 
                                        "Home".equals(u.getAddresses().get(0).getLabel()))
                .verifyComplete();
    }

    @Test
    public void testUpdateUser() {
        when(userRepository.save(any(User.class))).thenReturn(Mono.just(sampleUser));

        StepVerifier.create(userService.updateUser(sampleUser))
                .expectNextMatches(u -> u.getId().equals("user-123"))
                .verifyComplete();
    }

    @Test
    public void testDeleteById() {
        when(userRepository.deleteById("user-123")).thenReturn(Mono.empty());

        StepVerifier.create(userService.deleteById("user-123"))
                .verifyComplete();
        verify(userRepository, times(1)).deleteById("user-123");
    }
}
