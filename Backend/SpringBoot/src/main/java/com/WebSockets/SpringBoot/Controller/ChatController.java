//chat controller
package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.DTOS.MessageDTO;
import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import com.WebSockets.SpringBoot.Services.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import  com.WebSockets.SpringBoot.Models.ChatMessage;
@Controller
@RequiredArgsConstructor
public class ChatController {
    private  final ChatMessageService service;
    private  final SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public ChatMessage broadcastMessage(ChatMessage message){
        return message;
    }
    @MessageMapping("/private-message")
    public  void  sendPrivateMessage(ChatMessage message){
        System.out.println(message);
  ChatMessageEntity entity= service.save(message);
        MessageDTO dto = new MessageDTO();
        dto.setId(entity.getId());
        dto.setSenderPhone(entity.getSenderPhone());
        dto.setReceiverPhone(entity.getReceiverPhone());
        dto.setContent(entity.getContent());
        dto.setTimeStamp(entity.getTimestamp());
        System.out.println("reached");
   messagingTemplate.convertAndSendToUser(message.getTo(),"/queue/message",dto);
   messagingTemplate.convertAndSendToUser(message.getFrom(),"/queue/message",dto);

    }
}
