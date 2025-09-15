package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.DTOS.UserDto;
import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Models.LoginRequestModel;
import com.WebSockets.SpringBoot.Models.SignUpRequestModel;
import com.WebSockets.SpringBoot.Repository.UserRepository;
import com.WebSockets.SpringBoot.customException.UserNotFoundException;
import com.WebSockets.SpringBoot.customException.WrongPasswordException;
import jakarta.validation.Valid;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final TokenService tokenService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService,
                       TokenService tokenService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.tokenService = tokenService;
    }

    public UserDto login(LoginRequestModel requestModel) {
        UserEntity user = userRepository.findByEmail(requestModel.getEmail())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(requestModel.getPassword(), user.getPassword())) {
            throw new WrongPasswordException("Wrong Password, try again");
        }

        // create and persist refresh token (server-side)
        tokenService.createAndSaveRefreshToken(user);

        // create access token to return to client
        String accessToken = jwtService.generateAccessToken(user.getEmail());

        return new UserDto(user.getId(), user.getName(), user.getEmail(), accessToken);
    }

    public UserDto signUp(@Valid SignUpRequestModel request) {
        userRepository.findByEmail(request.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Email already exists, please login instead");
                });

        UserEntity entity = new UserEntity();
        entity.setName(request.getName());
        entity.setEmail(request.getEmail());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));

        UserEntity saved = userRepository.save(entity);

        // Generate and save refresh token server-side
        tokenService.createAndSaveRefreshToken(saved);

        // Return only access token to client
        String accessToken = jwtService.generateAccessToken(saved.getEmail());

        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), accessToken);
    }
}
