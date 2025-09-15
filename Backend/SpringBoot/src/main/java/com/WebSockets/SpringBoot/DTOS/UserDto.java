package com.WebSockets.SpringBoot.DTOS;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@RequiredArgsConstructor
public class UserDto {
    private long id;
    private String name ;
    private String  email;
    private  String userToken;



}
