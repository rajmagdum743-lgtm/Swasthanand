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
@org.springframework.security.config.annotation.method.configuration.EnableReactiveMethodSecurity
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
    public org.springframework.security.access.hierarchicalroles.RoleHierarchy roleHierarchy() {
        return org.springframework.security.access.hierarchicalroles.RoleHierarchyImpl.fromHierarchy(
            "ROLE_ADMIN > ROLE_DEALER\nROLE_DEALER > ROLE_CUSTOMER"
        );
    }

    @org.springframework.beans.factory.annotation.Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://localhost:8081}")
    private String allowedOriginsStr;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        http
            .csrf(ServerHttpSecurity.CsrfSpec::disable)
            .headers(headers -> headers
                .frameOptions(frame -> frame.mode(org.springframework.security.web.server.header.XFrameOptionsServerHttpHeadersWriter.Mode.DENY))
                .contentTypeOptions(ServerHttpSecurity.HeaderSpec.ContentTypeOptionsSpec::disable)
            )
            .authenticationManager(authenticationManager)
            .securityContextRepository(securityContextRepository)
            .authorizeExchange(exchanges -> exchanges
                .pathMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                .pathMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**", "/webjars/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/request-otp").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/verify-otp").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.GET, "/api/auth/check-phone/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/login").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/auth/register").permitAll()
                .pathMatchers("/api/recommend/**", "/api/locations/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.GET, "/api/products/**").permitAll()
                .pathMatchers(org.springframework.http.HttpMethod.POST, "/api/products/**").hasAnyRole("ADMIN", "DEALER")
                .pathMatchers(org.springframework.http.HttpMethod.PUT, "/api/products/**").hasAnyRole("ADMIN", "DEALER")
                .pathMatchers(org.springframework.http.HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                .pathMatchers("/api/admin/**").hasRole("ADMIN")
                .pathMatchers("/api/dealer/**").hasRole("DEALER")
                .pathMatchers(org.springframework.http.HttpMethod.PUT, "/api/auth/profile").authenticated()
                .anyExchange().permitAll()
            );
        
        return http.build();
    }

    @Bean
    public CorsWebFilter corsWebFilter() {
        CorsConfiguration config = new CorsConfiguration();
        List<String> origins = List.of(allowedOriginsStr.split(","));
        config.setAllowedOriginPatterns(origins);
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsWebFilter(source);
    }
}
