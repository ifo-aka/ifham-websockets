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
        UserEntity user = userRepository.findByUsername(requestModel.getUsername())
                .orElseThrow(() -> new UserNotFoundException("User not found"));

        if (!passwordEncoder.matches(requestModel.getPassword(), user.getPassword())) {
            throw new WrongPasswordException("Wrong Password, try again");
        }

        // create and persist refresh token (server-side)
        tokenService.createAndSaveRefreshToken(user);

        // create access token to return to client
        String accessToken = jwtService.generateAccessToken(user.getUsername());

        return new UserDto(user.getId(), user.getUsername(), user.getEmail(),user.getPhoneNumber() ,accessToken);
    }

    public UserDto signUp(@Valid SignUpRequestModel request) {
        userRepository.findByUsername(request.getEmail())
                .ifPresent(u -> {
                    throw new RuntimeException("Email already exists, please login instead");
                });

        UserEntity entity = new UserEntity();
        entity.setUsername(request.getUsername());
        entity.setEmail(request.getEmail());
        entity.setPassword(passwordEncoder.encode(request.getPassword()));
        entity.setPhoneNumber(request.getPhonenumber());

        UserEntity saved = userRepository.save(entity);

        // Generate and save refresh token server-side
        tokenService.createAndSaveRefreshToken(saved);

        // Return only access token to client
        String accessToken = jwtService.generateAccessToken(saved.getUsername());

        return new UserDto(saved.getId(), saved.getUsername(), saved.getEmail(),saved.getPhoneNumber(), accessToken);
    }
}
