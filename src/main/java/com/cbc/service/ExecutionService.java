package com.cbc.service;

import com.cbc.dto.execution.ExecuteCodeRequest;
import com.cbc.dto.execution.ExecuteCodeResponse;
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
        if (request.language().contentEquals("java")) {
            return javaExecutor.execute(request.sourceCode());
        }
        return new ExecuteCodeResponse("hello", "", 1, 1L);
    }

    @Async("executionTaskExecutor")
    public void executeAsync(ExecuteCodeRequest request, String executorEmail) {
        String roomId = request.roomId();
        String destination = "/topic/room/" + roomId;

        try {
            ChatMessage startMessage = new ChatMessage(
                    roomId,
                    executorEmail,
                    "Execution started...",
                    LocalDateTime.now(),
                    MessageType.EXECUTION_START
            );
            simpMessagingTemplate.convertAndSend(destination, startMessage);

            ExecuteCodeResponse executionResponse;
            if ("java".equalsIgnoreCase(request.language())) {
                executionResponse = javaExecutor.execute(request.sourceCode());
            } else {
                executionResponse = new ExecuteCodeResponse("hello", "", 1, 1L);
            }

            String responseJson = objectMapper.writeValueAsString(executionResponse);
            ChatMessage resultMessage = new ChatMessage(
                    roomId,
                    executorEmail,
                    responseJson,
                    LocalDateTime.now(),
                    MessageType.EXECUTION_RESULT
            );
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

                ChatMessage errorMessage = new ChatMessage(
                        roomId,
                        executorEmail,
                        errorJson,
                        LocalDateTime.now(),
                        MessageType.EXECUTION_RESULT
                );
                simpMessagingTemplate.convertAndSend(destination, errorMessage);
            } catch (Exception ignored) {
            }
        }
    }
}
