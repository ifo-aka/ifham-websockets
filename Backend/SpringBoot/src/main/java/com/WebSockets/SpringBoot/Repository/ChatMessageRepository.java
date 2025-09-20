package com.WebSockets.SpringBoot.Repository;

import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessageEntity,Long> {
    List<ChatMessageEntity> findByReceiverPhoneAndStatus(String receiverPhone, String status);
}
