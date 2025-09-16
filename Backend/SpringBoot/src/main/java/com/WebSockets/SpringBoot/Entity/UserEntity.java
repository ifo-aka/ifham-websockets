package com.WebSockets.SpringBoot.Entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "Users")
@Getter
@Setter
public class UserEntity {
    @Id
    @Column(name = "id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotBlank(message = "Email is required")
    @Email(message = "Please provide a valid email (e.g: example@gmail.com)")
    @Column(name = "email", unique = true, nullable = false)
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z]).{5,}$",
            message = "Password must be at least 5 characters, contain 1 digit, 1 lowercase and 1 uppercase letter"
    )
    @Column(nullable = false)
    private String password;

    @NotBlank(message = "Username is required")
    @Pattern(
            regexp = "^(?=.*[A-Za-z])[A-Za-z0-9_-]{5,12}$",
            message = "Username must be 5–12 characters long, contain letters, and may include numbers, '_' or '-'"
    )
    @Column(name = "username", unique = true, nullable = false)
    private String username;

    @Column(name = "phonenumber", nullable = false, unique = true, length = 11)
    @NotBlank(message = "Phone is required")
    @Size(min = 11, max = 11, message = "Phone must be exactly 11 digits")
    @Pattern(regexp = "^034\\d{8}$", message = "Phone must start with 034 and be 11 digits total")
    private String phonenumber;

    @Column(name = "refreshToken", length = 1000)
    private String refreshToken;

    @Column(name = "exp")
    private LocalDateTime refreshTokenExpiry;
}
