package com.WebSockets.SpringBoot.DTOS;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactDto {
    private Long id;
    private String savedAs;
    private String phoneNumber;
    private String nickname;
    private String profilePictureUrl;
}
