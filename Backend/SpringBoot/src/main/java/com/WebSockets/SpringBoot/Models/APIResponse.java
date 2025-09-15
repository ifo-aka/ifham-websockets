package com.WebSockets.SpringBoot.Models;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@AllArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL) // avoid null fields in JSON
public class APIResponse<T> {
    private boolean success;
    private String message;
    private T data;
}
