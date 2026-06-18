package com.cbc.dto.user;

import com.cbc.entity.Role;

public record UserResponse(
    Long id,
    String name,
    String email,
    Role role
) {}
