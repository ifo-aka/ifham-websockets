package com.WebSockets.SpringBoot.GlobalExceptionHandler;

import com.WebSockets.SpringBoot.Models.APIResponse;

import jakarta.validation.ConstraintViolationException;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;
@RestControllerAdvice
public class ExceptionHandlerGlobal {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<APIResponse<Map<String,String>>> handleValidationException(MethodArgumentNotValidException ex){
        Map<String ,String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(e ->
                errors.put(e.getField(), e.getDefaultMessage())
        );
        return ResponseEntity.badRequest()
                .body(new APIResponse<>(false, "Fields are not valid", errors));
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
    public ResponseEntity<APIResponse<String>> duplicateViolationException(DataIntegrityViolationException ex){
        String message = ex.getMessage();
        if (message != null && message.contains("user.email")) {
            return ResponseEntity.badRequest()
                    .body(new APIResponse<>(false, "Email already exists", null));
        }
        return ResponseEntity.badRequest()
                .body(new APIResponse<>(false, "Data Integrity violation", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<APIResponse<String>> handleOtherExceptions(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new APIResponse<>(false, ex.getMessage(), null));
    }
}