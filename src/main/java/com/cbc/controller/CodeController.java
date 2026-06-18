package com.cbc.controller;

import com.cbc.dto.code.ChatMessage;
import com.cbc.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@RequiredArgsConstructor
public class CodeController {
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final RoomService roomService;

    @MessageMapping("/chat.send")
    public void sendMessage(@Payload ChatMessage chatMessage, SimpMessageHeaderAccessor headerAccessor, Principal principal) {
        roomService.validateRoomMembership(principal.getName(), Long.parseLong(chatMessage.roomId()));

        headerAccessor.getSessionAttributes().put("username", chatMessage.creator());
        headerAccessor.getSessionAttributes().put("roomId", chatMessage.roomId());

        simpMessagingTemplate.convertAndSend(
               "/topic/room/" + chatMessage.roomId(), chatMessage
        );
    }

}
