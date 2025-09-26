package com.WebSockets.SpringBoot.Controller;

import com.WebSockets.SpringBoot.DTOS.MessageDTO;
import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import com.WebSockets.SpringBoot.Models.APIResponse;
import com.WebSockets.SpringBoot.Services.ChatMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatRestController {
  private final  ChatMessageService chatMessageService;

    @GetMapping("/{receiver}/getUnread")
    public APIResponse<List<MessageDTO>> getUnread(@PathVariable String receiver){

        List<ChatMessageEntity> unread = chatMessageService.getUnreadFor(receiver);


      List<MessageDTO>  messageDTOS= unread.stream().map((message)-> new MessageDTO(message.getId(),message.getSenderPhone(), message.getReceiverPhone(), message.getContent(),message.getTimestamp(),message.getStatus())).toList();
        return new APIResponse<>(true,"unread messages",messageDTOS);
    }
    @GetMapping("/{userPhone}/allConversations")
    public APIResponse< List<MessageDTO>> getAllConversations(@PathVariable String userPhone) {

       List<ChatMessageEntity> entities = chatMessageService.getAllConversations(userPhone);

       List<MessageDTO> conversation =   entities.stream() .map(m -> new MessageDTO(m.getId(), m.getSenderPhone(), m.getReceiverPhone(),
                                        m.getContent(), m.getTimestamp(), m.getStatus()))
                                .toList();


        return new APIResponse<>(true, "All conversations grouped by contact", conversation);
    }
}
