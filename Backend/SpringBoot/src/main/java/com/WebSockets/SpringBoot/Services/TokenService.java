package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Repository.UserRepository;
import com.WebSockets.SpringBoot.customException.UserNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class TokenService {
    private final UserRepository repository;
    private final JwtService jwtService;

    public void createAndSaveRefreshToken(UserEntity user) {
        String refresh = jwtService.generateRefreshToken(user.getEmail());
        user.setRefreshToken(refresh);
        // compute expiry using jwtService's refreshExpiration (millis)
        user.setRefreshTokenExpiry(LocalDateTime.now().plusNanos(jwtService.getRefreshExpiration() * 1_000_000L));
        repository.save(user);
    }

    public boolean isRefreshTokenValidForUser(String email) {
        UserEntity user = repository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        String stored = user.getRefreshToken();
        LocalDateTime expiry = user.getRefreshTokenExpiry();
        if (stored == null || expiry == null) return false;
        if (expiry.isBefore(LocalDateTime.now())) return false;

        // verify stored refresh token is a valid JWT (signature + not expired)
        return jwtService.isTokenValid(stored, email);
    }

    public void clearRefreshToken(UserEntity user){
        user.setRefreshToken(null);
        user.setRefreshTokenExpiry(null);
        repository.save(user);
    }
}
