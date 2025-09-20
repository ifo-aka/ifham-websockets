package com.WebSockets.SpringBoot.security;

import com.WebSockets.SpringBoot.Services.JwtService;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Entity.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.security.Principal;

@Component
@RequiredArgsConstructor
public class JwtChannelInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;
    private final AuthRepository userRepository;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor =
                MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");

            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                String username = jwtService.extractUsername(token);

                userRepository.findByUsername(username).ifPresent(user -> {
                    accessor.setUser(new StompPrincipal(user.getPhoneNumber()));
                });
            }
        }
        return message;
    }

    static class StompPrincipal implements Principal {
        private final String name;
        public StompPrincipal(String name) { this.name = name; }
        @Override
        public String getName() { return name; }
    }
}
