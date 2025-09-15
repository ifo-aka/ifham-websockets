package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.DTOS.UserDto;
import com.WebSockets.SpringBoot.Models.APIResponse;
import com.WebSockets.SpringBoot.Models.LoginRequestModel;
import com.WebSockets.SpringBoot.Models.SignUpRequestModel;
import com.WebSockets.SpringBoot.Services.AuthService;
import com.WebSockets.SpringBoot.Services.JwtService;
import com.WebSockets.SpringBoot.Services.TokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final TokenService tokenService;

    @PostMapping("/signUp")
    public APIResponse<UserDto> signUp(@RequestBody @Valid SignUpRequestModel request) {
        UserDto dto = authService.signUp(request);
        return new APIResponse<>(true, "User signed successfully", dto);
    }

    @PostMapping("/login")
    public APIResponse<UserDto> login(@RequestBody @Valid LoginRequestModel model){
        UserDto dto = authService.login(model);
        return new APIResponse<>(true,"logged success",dto);
    }

    // Client calls this when access token expired (client sends the expired access token)
    @GetMapping("/refresh")
    public APIResponse<Map<String,String>> refreshToken(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return new APIResponse<>(false, "No token provided", null);
        }
        String accessToken = authHeader.substring(7);
        String username = jwtService.extractUsernameAllowExpired(accessToken);

        if (username == null) {
            return new APIResponse<>(false, "Invalid token", null);
        }

        if (!tokenService.isRefreshTokenValidForUser(username)) {
            return new APIResponse<>(false, "No valid refresh token on server", null);
        }

        String newAccess = jwtService.generateAccessToken(username);

        Map<String, String> body = Map.of("accessToken", newAccess);
        return new APIResponse<>(true, "Access token refreshed", body);
    }
}
