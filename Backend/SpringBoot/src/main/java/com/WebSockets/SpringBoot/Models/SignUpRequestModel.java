
package com.WebSockets.SpringBoot.Models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class SignUpRequestModel {
    @NotBlank

    private String username;

    @Email(message = "please ensure your email is valid")
    private String email;

    @NotBlank(message = "Password is required")

    private String password;

}
