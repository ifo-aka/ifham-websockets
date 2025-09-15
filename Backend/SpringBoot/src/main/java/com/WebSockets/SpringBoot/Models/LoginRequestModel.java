package com.WebSockets.SpringBoot.Models;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
public class LoginRequestModel {
    private  String username;
    private String password;

}
