package com.cbc.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class JoinRoomRequest {

    @NotBlank
    private String roomCode;
}
