package com.WebSockets.SpringBoot.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TypingEvent {
    private String from; // The user who is typing (their phone number)
    private String to;   // The user who should see the indicator (their phone number)
    private boolean typing; // true if typing, false if stopped
}
