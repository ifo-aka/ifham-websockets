//message dto to send back to user
package com.WebSockets.SpringBoot.DTOS;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Data
@Getter
@Setter
public class MessageDTO {
   private  Long id;
   private  String senderPhone;
   private  String receiverPhone;
   private  String content;
   private Instant timeStamp;

}
