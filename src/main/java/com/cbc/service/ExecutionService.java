package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeRequest;
import com.cbc.dto.Execution.ExecuteCodeResponse;
import com.cbc.dto.code.ChatMessage;
import com.cbc.entity.MessageType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final CodeExecutor javaExecutor;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ObjectMapper objectMapper;

    public ExecuteCodeResponse execute(ExecuteCodeRequest request) {
        if (request.getLanguage().contentEquals("java")) {
            return javaExecutor.execute(request.getSourceCode());
        }
        return new ExecuteCodeResponse("hello", "", 1, 1L);
    }

    @Async("executionTaskExecutor")
    public void executeAsync(ExecuteCodeRequest request, String executorEmail) {
        String roomId = request.getRoomId();
        String destination = "/topic/room/" + roomId;

        try {
            ChatMessage startMessage = new ChatMessage();
            startMessage.setRoomId(roomId);
            startMessage.setCreator(executorEmail);
            startMessage.setContent("Execution started...");
            startMessage.setLocalDateTime(LocalDateTime.now());
            startMessage.setMessageType(MessageType.EXECUTION_START);
            simpMessagingTemplate.convertAndSend(destination, startMessage);

            ExecuteCodeResponse executionResponse;
            if ("java".equalsIgnoreCase(request.getLanguage())) {
                executionResponse = javaExecutor.execute(request.getSourceCode());
            } else {
                executionResponse = new ExecuteCodeResponse("hello", "", 1, 1L);
            }

            String responseJson = objectMapper.writeValueAsString(executionResponse);
            ChatMessage resultMessage = new ChatMessage();
            resultMessage.setRoomId(roomId);
            resultMessage.setCreator(executorEmail);
            resultMessage.setContent(responseJson);
            resultMessage.setLocalDateTime(LocalDateTime.now());
            resultMessage.setMessageType(MessageType.EXECUTION_RESULT);
            simpMessagingTemplate.convertAndSend(destination, resultMessage);

        } catch (Exception e) {
            try {
                ExecuteCodeResponse errorResponse = ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr(e.getMessage())
                        .exitCode(-1)
                        .executionTime(0L)
                        .build();
                String errorJson = objectMapper.writeValueAsString(errorResponse);

                ChatMessage errorMessage = new ChatMessage();
                errorMessage.setRoomId(roomId);
                errorMessage.setCreator(executorEmail);
                errorMessage.setContent(errorJson);
                errorMessage.setLocalDateTime(LocalDateTime.now());
                errorMessage.setMessageType(MessageType.EXECUTION_RESULT);
                simpMessagingTemplate.convertAndSend(destination, errorMessage);
            } catch (Exception ignored) {
            }
        }
    }
}
