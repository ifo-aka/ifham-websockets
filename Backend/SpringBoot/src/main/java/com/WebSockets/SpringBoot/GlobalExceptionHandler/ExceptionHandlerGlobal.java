package com.WebSockets.SpringBoot.GlobalExceptionHandler;

import com.WebSockets.SpringBoot.Models.APIResponse;

import com.WebSockets.SpringBoot.customException.UserNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.hibernate.service.UnknownServiceException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
@RestControllerAdvice
public class ExceptionHandlerGlobal  {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errors.put(e.getField(), e.getDefaultMessage())
        );
        return ResponseEntity.badRequest()
                .body(new APIResponse<>(false, "Validation failed", errors));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<APIResponse<Map<String, String>>> handleConstraintViolations(ConstraintViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getConstraintViolations().forEach(violation ->
                errors.put(violation.getPropertyPath().toString(), violation.getMessage())
        );
        return ResponseEntity.badRequest()
                .body(new APIResponse<>(false, "Validation failed", errors));
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<APIResponse<String>> duplicateViolationException(DataIntegrityViolationException ex) {
        String message = ex.getMessage();
        if (message != null && message.contains("email")) {
            return ResponseEntity.badRequest()
                    .body(new APIResponse<>(false, "validation failed", "Email already exists"));
        }
        if (message != null && message.contains("username")) {
            return ResponseEntity.badRequest()
                    .body(new APIResponse<>(false, "validation failed", "Username is already is use"));
        }
        return ResponseEntity.badRequest()
                .body(new APIResponse<>(false, "validation failed", ex.getLocalizedMessage()));
    }
    @ExceptionHandler(UserNotFoundException.class)
    public  ResponseEntity<APIResponse<String>> handleUserNotFoundException(UserNotFoundException ex){
        return ResponseEntity.badRequest().body(new APIResponse<>(false," validation Failed",ex.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<String>> handleOtherExceptions(Exception ex) {
        ex.printStackTrace(); // Or use a logger
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new APIResponse<>(false, "Something went wrong on the server", ex.getMessage()));
    }
}
