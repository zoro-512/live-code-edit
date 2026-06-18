package com.cbc.webSocket;

import com.cbc.dto.code.ChatMessage;
import com.cbc.entity.MessageType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Component
@Slf4j
@RequiredArgsConstructor
public class WebSocketEventListener {

    private final SimpMessagingTemplate simpMessagingTemplate;

    @EventListener
    public void handleDisconnectEventListner(SessionDisconnectEvent sessionDisconnectEvent){
        StompHeaderAccessor stompHeaderAccessor = StompHeaderAccessor.wrap(sessionDisconnectEvent.getMessage());

        // Retrieve attributes from session
        String username = (String) stompHeaderAccessor.getSessionAttributes().get("username");
        String roomId = (String) stompHeaderAccessor.getSessionAttributes().get("roomId");
        if (username != null && roomId != null) {
            ChatMessage chatMessage = new ChatMessage(roomId, username, null, java.time.LocalDateTime.now(), MessageType.LEFT);

            simpMessagingTemplate.convertAndSend(
                    "/topic/room/" + roomId, chatMessage
            );
        }
    }
}
