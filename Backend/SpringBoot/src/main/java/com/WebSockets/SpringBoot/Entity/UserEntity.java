package com.WebSockets.SpringBoot.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class UserEntity {
    @Id
    @Column (name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @NotBlank(message = "email is required")
    @Column(name = "email",unique = true,nullable = false)
    @Email(message = "Please provide valid email(e.g : example@gmail.com")
     private String  email;

    @Column(nullable = false)
    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{5,}$")
    private String password;
   @NotBlank(message = "name is required.")
   @Column(name = "name")
    private String name;

    @Column(name = "refreshToken", length = 500)
    private String refreshToken;
    @Column(name = "exp")
    private LocalDateTime refreshTokenExpiry;

}
