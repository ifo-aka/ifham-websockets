package com.WebSockets.SpringBoot.Controller;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import  com.WebSockets.SpringBoot.Models.ChatMessage;
@Controller
public class ChatController {

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public ChatMessage broadcastMessage(ChatMessage message){
        return message;
    }
}
