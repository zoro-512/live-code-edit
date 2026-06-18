package com.cbc.dto.code;

import com.cbc.entity.MessageType;
import java.time.LocalDateTime;

public record ChatMessage(
    String roomId,
    String creator,
    String content,
    LocalDateTime localDateTime,
    MessageType messageType
) {}
