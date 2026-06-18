package com.cbc.dto.auth;

public record LoginReq(
    String email,
    String password
) {}
