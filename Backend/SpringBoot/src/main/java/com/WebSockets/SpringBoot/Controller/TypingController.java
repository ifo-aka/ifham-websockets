package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.Models.TypingEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
public class TypingController {

    private final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/typing")
    public void handleTypingEvent(TypingEvent typingEvent) {
        // Forward the typing event to the recipient's private queue
        messagingTemplate.convertAndSendToUser(
            typingEvent.getTo(),
            "/queue/typing",
            typingEvent
        );
    }
}
