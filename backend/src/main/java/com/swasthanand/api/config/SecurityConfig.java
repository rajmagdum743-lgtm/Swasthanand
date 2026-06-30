package com.swasthanand.api.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsWebFilter;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import com.swasthanand.api.security.JwtAuthenticationManager;
import com.swasthanand.api.security.SecurityContextRepository;

import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    private final SecurityContextRepository securityContextRepository;
    private final JwtAuthenticationManager authenticationManager;

    public SecurityConfig(SecurityContextRepository securityContextRepository, JwtAuthenticationManager authenticationManager) {
        this.securityContextRepository = securityContextRepository;
        this.authenticationManager = authenticationManager;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .authenticationManager(authenticationManager)
            .securityContextRepository(securityContextRepository)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .pathMatchers("/api/auth/**", "/api/recommend/**", "/api/locations/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "DEALER")
                .pathMatchers(org.springframework.http.HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "DEALER")
                .pathMatchers(org.springframework.http.HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .pathMatchers("/api/admin/**").hasRole("ADMIN")
                .pathMatchers("/api/dealer/**").hasRole("DEALER")
                .anyExchange().permitAll()
            );
        
        return http.build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOriginPatterns(List.of("*"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
