package com.cbc.dto.room;

public record RoomResponse(
    Long id,
    String roomName,
    String roomCode
) {}
