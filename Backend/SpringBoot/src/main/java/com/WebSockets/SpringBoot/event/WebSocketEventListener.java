package com.WebSockets.SpringBoot.event;

import com.WebSockets.SpringBoot.Models.PresenceStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.security.Principal;
import java.time.Instant;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;

    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = headerAccessor.getUser();
        if (userPrincipal != null) {
            String username = userPrincipal.getName(); // This is the phone number
            log.info("User connected: {}", username);
            PresenceStatus presenceStatus = new PresenceStatus(username, "ONLINE", null);
            messagingTemplate.convertAndSend("/topic/presence", presenceStatus);
        }
    }

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Principal userPrincipal = headerAccessor.getUser();
        if (userPrincipal != null) {
            String username = userPrincipal.getName();
            log.info("User disconnected: {}", username);
            PresenceStatus presenceStatus = new PresenceStatus(username, "OFFLINE", Instant.now());
            messagingTemplate.convertAndSend("/topic/presence", presenceStatus);
        }
    }
}