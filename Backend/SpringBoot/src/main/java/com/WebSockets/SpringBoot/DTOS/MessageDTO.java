//message dto to send back to user
package com.WebSockets.SpringBoot.DTOS;

import com.WebSockets.SpringBoot.Entity.ChatMessageEntity;
import lombok.*;

import java.time.Instant;

@Data
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor


public class MessageDTO {
   private  Long id;
   private  String senderPhone;
   private  String receiverPhone;
   private  String content;
   private Instant timeStamp;
   private  String status;



}
