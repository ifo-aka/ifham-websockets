package com.WebSockets.SpringBoot.Entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Contacts",
uniqueConstraints = {
@UniqueConstraint(columnNames = {"user_id", "phone_number"})
    }
)
@Getter
@Setter
public class ContactEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "contact_id")
    private long id;

    @NotBlank(message = "Saved As can't be blank")
    @Column(name = "saved_as", nullable = false)
    private String savedAs;

    @NotBlank(message = "Phone number can't be blank")
    @Size(min = 11, max = 11, message = "Phone must be exactly 11 digits")
    @Pattern(regexp = "^034\\d{8}$", message = "Phone must start with 034 and be 11 digits total")
    @Column(name = "phone_number", nullable = false, length = 11)
    private String phoneNumber;

    // 🔥 Many Contacts → Belong to One User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private UserEntity user;
}
