package com.WebSockets.SpringBoot.Controller;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.util.Map;

@Slf4j
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
        log.info("Forwarding call to {}", targetUsername);

        messagingTemplate.convertAndSendToUser(targetUsername, "/queue/call", payload);
    }

    @MessageMapping("/answer-call")
    public void answerCall(@Payload Map<String, Object> payload, SimpMessageHeaderAccessor headerAccessor) {
        String targetUsername = (String) payload.get("to");
        messagingTemplate.convertAndSendToUser(targetUsername, "/queue/call-accepted", payload);
    }

    @MessageMapping("/ice-candidate")
    public void handleIceCandidate(@Payload Map<String, Object> payload) {
        String targetUsername = (String) payload.get("target");
        // Simply forward the payload without modification
        messagingTemplate.convertAndSendToUser(targetUsername, "/queue/ice-candidate", payload);
    }
    @MessageMapping("/decline-call")
    public void HandleDecline(@Payload Map<String,Object> payload){
        String targetUserName=(String) payload.get("to");
        String from= (String) payload.get("from");
        log.info("call  from {} declined by callee",from);
        messagingTemplate.convertAndSendToUser(targetUserName,"/queue/call-declined",payload);

    }

}