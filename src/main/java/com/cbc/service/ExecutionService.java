package com.cbc.service;

import com.cbc.dto.execution.ExecuteCodeRequest;
import com.cbc.dto.execution.ExecuteCodeResponse;
import com.cbc.dto.code.ChatMessage;
import com.cbc.entity.MessageType;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExecutionService {

    private final CodeExecutor javaExecutor;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ObjectMapper objectMapper;

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
                executionResponse = javaExecutor.execute(request.files());
            } else {
                executionResponse = ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr("Language '" + request.language() + "' is not supported for server-side execution.")
                        .exitCode(1)
                        .executionTime(0L)
                        .build();
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
            log.error("Execution failed for room {} by {}: {}", roomId, executorEmail, e.getMessage(), e);
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
            } catch (Exception innerException) {
                log.error("Failed to send error message to room {}: {}", roomId, innerException.getMessage());
            }
        }
    }
}
