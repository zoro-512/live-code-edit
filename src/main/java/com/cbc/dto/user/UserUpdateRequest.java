package com.cbc.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UserUpdateRequest(
    @NotBlank
    @Size(min = 3, max = 25)
    String name,
    
    String password
) {}
