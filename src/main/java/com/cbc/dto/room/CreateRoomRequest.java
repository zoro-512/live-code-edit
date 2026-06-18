package com.cbc.dto.room;

import jakarta.validation.constraints.NotBlank;

public record CreateRoomRequest(
    @NotBlank
    String roomName
) {}
