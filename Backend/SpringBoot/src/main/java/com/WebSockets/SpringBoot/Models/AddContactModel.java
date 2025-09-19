package com.WebSockets.SpringBoot.Models;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddContactModel {
    @NotBlank(message = "Saved As can't be blank")

    private String savedAs;

    @NotBlank(message = "Phone number can't be blank")
    @Size(min = 11, max = 11, message = "Phone must be exactly 11 digits")
    @Pattern(regexp = "^034\\d{8}$", message = "Phone must start with 034 and be 11 digits total")

    private String phoneNumber;
}
