package com.bloodbridge.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(
    int status,
    String error,
    String message,
    List<FieldError> details,
    LocalDateTime timestamp
) {
    public ApiError(int status, String error, String message) {
        this(status, error, message, null, LocalDateTime.now());
    }

    public ApiError(int status, String error, String message, List<FieldError> details) {
        this(status, error, message, details, LocalDateTime.now());
    }

    public record FieldError(String field, String message) {}
}
