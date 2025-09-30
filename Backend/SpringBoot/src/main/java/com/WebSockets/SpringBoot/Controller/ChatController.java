//chat controller
package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.DTOS.MessageDTO;
import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import com.WebSockets.SpringBoot.Entity.UserEntity;
import com.WebSockets.SpringBoot.Repository.AuthRepository;
import com.WebSockets.SpringBoot.Services.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import  com.WebSockets.SpringBoot.Models.ChatMessage;

import java.util.Optional;

@Controller
@RequiredArgsConstructor
public class ChatController {
    private  final ChatMessageService service;
    private  final SimpMessagingTemplate messagingTemplate;
    private final AuthRepository authRepository;

    @MessageMapping("/sendMessage")
    @SendTo("/topic/messages")
    public MessageDTO broadcastMessage(ChatMessage message){
        ChatMessageEntity entity = service.save(message);
        MessageDTO dto = new MessageDTO();
        dto.setId(entity.getId());
        dto.setReceiverPhone(entity.getReceiverPhone());
        dto.setSenderPhone(entity.getSenderPhone());
        dto.setContent(entity.getContent());
        dto.setTimeStamp(entity.getTimestamp());
        return dto;
    }

    @MessageMapping("/private-message")
    public void sendPrivateMessage(ChatMessage message){
        ChatMessageEntity entity = service.save(message);
        MessageDTO dto = new MessageDTO();



        dto.setId(entity.getId());
        dto.setReceiverPhone(entity.getReceiverPhone());
        dto.setSenderPhone(entity.getSenderPhone());
        dto.setContent(entity.getContent());
        dto.setTimeStamp(entity.getTimestamp());
        dto.setStatus(entity.getStatus());

        messagingTemplate.convertAndSendToUser(message.getTo(), "/queue/message", dto);
        messagingTemplate.convertAndSendToUser(message.getFrom(), "/queue/message", dto);
    }
    @MessageMapping("/updateStatus")
    public void updateMessageStatus(MessageDTO statusUpdate) {
        // Update DB
        service.updateStatus(statusUpdate.getId(), statusUpdate.getStatus());

        // Notify both sender & receiver about the new status
        messagingTemplate.convertAndSendToUser(
                statusUpdate.getSenderPhone(), "/queue/status", statusUpdate);
        messagingTemplate.convertAndSendToUser(
                statusUpdate.getReceiverPhone(), "/queue/status", statusUpdate);
    }

}
