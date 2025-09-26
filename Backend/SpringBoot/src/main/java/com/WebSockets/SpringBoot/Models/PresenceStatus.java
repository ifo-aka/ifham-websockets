package com.WebSockets.SpringBoot.Models;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PresenceStatus {
    private String userId;
    private String status; // e.g., "ONLINE" or "OFFLINE"
    private java.time.Instant lastSeen;
}