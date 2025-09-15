package com.WebSockets.SpringBoot.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;
@Configuration
public class CorsConfig {
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())

                .authorizeHttpRequests(auth -> auth
                        // Public endpoints (no JWT needed)
                        .requestMatchers(
                                "/api/auth/login",
                                "/api/auth/signUp/**",
                                "/progress",   // your SSE progress stream
                                "/submitdocs"  // if you want docs upload open
                        ).permitAll()

                        // Protected endpoints
                        .requestMatchers("/auth/check").authenticated()
                        .requestMatchers("/student/**").authenticated()

                        // Optional role-based
                        //.requestMatchers("/admin/**").hasRole("ADMIN")
                        //.requestMatchers("/dean/**").hasRole("DEAN")

                        .anyRequest().authenticated()
                );

        return http.build();
    }

@Bean
    public CorsConfigurationSource corsConfigurationSource(){
    CorsConfiguration corsConfiguration = new CorsConfiguration();
  corsConfiguration.setAllowedOrigins(List.of("http://localhost:5173"));
  corsConfiguration.setAllowedMethods(List.of("GET","PUT","DELETE","POST"));
  corsConfiguration.setAllowedHeaders(List.of("*"));
  corsConfiguration.setAllowCredentials(true);
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**",corsConfiguration);
    return source;
}
}
