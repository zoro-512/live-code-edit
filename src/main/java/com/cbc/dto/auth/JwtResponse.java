package com.cbc.dto.auth;

public record JwtResponse(
    String accessToken,
    String refreshToken,
    String email
) {}
