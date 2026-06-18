package com.cbc.dto.auth;

import jakarta.validation.constraints.NotBlank;

public record TokenRefreshRequest(
    @NotBlank(message = "Refresh token is required")
    String refreshToken
) {}
