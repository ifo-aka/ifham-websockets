package com.WebSockets.SpringBoot.Services;

import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import com.WebSockets.SpringBoot.Models.ChatMessage;
import com.WebSockets.SpringBoot.Repository.ChatMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChatMessageService {
    private final ChatMessageRepository repository;


    public ChatMessageEntity save(ChatMessage m){
        ChatMessageEntity entity = new ChatMessageEntity();
        entity.setSenderPhone(m.getFrom());
        entity.setReceiverPhone(m.getTo());
        entity.setContent(m.getContent());

        return  repository.save(entity);

    }
    public List<ChatMessageEntity> getUnreadFor(String phoneNumber){
      return   repository.findByReceiverPhoneAndStatus(phoneNumber,"SENT");
    }
    public void saveAll(List<ChatMessageEntity> msgs) {
        repository.saveAll(msgs);
    }
    public List<ChatMessageEntity> getAllConversations(String userPhone) {
        return repository.findBySenderPhoneOrReceiverPhoneOrderByTimestampAsc(userPhone, userPhone);

    }
    public void updateStatus(Long messageId, String status) {
        repository.findById(messageId).ifPresent(msg -> {
            msg.setStatus(status);
            repository.save(msg);
        });
    }

}
