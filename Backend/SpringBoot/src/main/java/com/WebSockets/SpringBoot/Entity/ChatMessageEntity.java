package com.WebSockets.SpringBoot.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
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
    @Column(name = "sender_phone",nullable = false)
    @NotBlank
    private String senderPhone;
    @Column(name = "receiver_phone",nullable = false)
    @NotBlank
    private String receiverPhone;

    @Column(name = "content", columnDefinition = "TEXT" ,nullable = false)
    @NotBlank
    private String content;
    @Column(name = "timestamp")

    private Instant timestamp = Instant.now();

    // SENT / DELIVERED / READ
    @Column(name = "status")
    private String status = "SENT";
}

