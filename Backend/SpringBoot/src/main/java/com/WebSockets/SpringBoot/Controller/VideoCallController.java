package com.WebSockets.SpringBoot.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Controller
public class VideoCallController {

    private final SimpMessagingTemplate messagingTemplate;

    public VideoCallController(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/call-user")
    public void callUser(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String targetUsername = (String) payload.get("userToCall");
        String senderUsername = (String) payload.get("from");
        payload.put("from", senderUsername);
        messagingTemplate.convertAndSendToUser(targetUsername, "/call", payload);
    }

    @MessageMapping("/answer-call")
    public void answerCall(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String targetUsername = (String) payload.get("to");
        messagingTemplate.convertAndSendToUser(targetUsername, "/call-accepted", payload);
    }

    @MessageMapping("/ice-candidate")
    public void handleIceCandidate(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String targetUsername = (String) payload.get("target");
        String senderUsername = headerAccessor.getUser().getName();
        payload.put("sender", senderUsername);
        messagingTemplate.convertAndSendToUser(targetUsername, "/ice-candidate", payload);
    }
}