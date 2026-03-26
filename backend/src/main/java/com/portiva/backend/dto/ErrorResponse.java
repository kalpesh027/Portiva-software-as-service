package com.portiva.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Standard error response — returned by GlobalExceptionHandler.
 *
 * SECURITY: Never exposes stack traces or internal details.
 * upgradeRequired + requiredPlan used for 403 plan-gate responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {
    private String message;
    private int status;
    private String timestamp;
    private Boolean upgradeRequired;
    private String requiredPlan;

    public static ErrorResponse of(int status, String message) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .timestamp(LocalDateTime.now().toString())
                .build();
    }
}
