package com.WebSockets.SpringBoot.Entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "messages")
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderPhone;
    private String receiverPhone;

    @Column(columnDefinition = "TEXT")
    private String content;

    private Instant timestamp = Instant.now();

    // SENT / DELIVERED / READ
    private String status = "SENT";
}

