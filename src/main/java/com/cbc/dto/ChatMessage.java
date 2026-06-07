package com.cbc.dto;

import com.cbc.entity.MessageType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {

    private String RoomId;
    private String Creator;
    private String content;
    private LocalDateTime localDateTime;
    private MessageType messageType;
}
