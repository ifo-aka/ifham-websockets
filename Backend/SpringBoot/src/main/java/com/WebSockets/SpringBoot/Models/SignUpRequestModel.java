
package com.WebSockets.SpringBoot.Models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignUpRequestModel {
    @NotBlank
    private String name;

    @Email(message = "please ensure your email is valid")
    private String email;

    @NotBlank
    private String password;
}
