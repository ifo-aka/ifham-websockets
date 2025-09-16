
package com.WebSockets.SpringBoot.Models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SignUpRequestModel {
    @NotBlank
    private String username;

    @Email(message = "please ensure your email is valid")
    private String email;

    @NotBlank(message = "Password is required")
    private String password;

    @NotBlank(message = "Phone is required")
    @Size(min = 11, max = 11, message = "Phone must be exactly 11 digits")
    @Pattern(regexp = "^034\\d{8}$", message = "Phone must start with 034 and be 11 digits total")
    private String phoneNumber;

}
