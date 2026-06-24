package com.cbc.service;

import com.cbc.dto.code.ChatMessage;
import com.cbc.dto.execution.ExecuteCodeRequest;
import com.cbc.dto.execution.ExecuteCodeResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import java.util.Map;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ExecutionServiceTest {

    @Mock
    private CodeExecutor javaExecutor;

    @Mock
    private SimpMessagingTemplate simpMessagingTemplate;

    @Mock
    private ObjectMapper objectMapper;

    @InjectMocks
    private ExecutionService executionService;

    @Test
    void executeAsync_JavaLanguage_Success() throws Exception {
        ExecuteCodeRequest request = new ExecuteCodeRequest(Map.of("Main.java", "public class Main {}"), "java", "123");
        ExecuteCodeResponse mockResponse = new ExecuteCodeResponse("success", "", 0, 100L);
        
        when(javaExecutor.execute(anyMap())).thenReturn(mockResponse);
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"stdout\":\"success\"}");

        executionService.executeAsync(request, "test@test.com");

        verify(simpMessagingTemplate, times(2)).convertAndSend(eq("/topic/room/123"), any(ChatMessage.class));
        verify(javaExecutor, times(1)).execute(Map.of("Main.java", "public class Main {}"));
    }

    @Test
    void executeAsync_UnsupportedLanguage_SendsError() throws Exception {
        ExecuteCodeRequest request = new ExecuteCodeRequest(Map.of("main.py", "print('hello')"), "python", "123");
        
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"stderr\":\"Language 'python' is not supported for server-side execution.\"}");

        executionService.executeAsync(request, "test@test.com");

        verify(simpMessagingTemplate, times(2)).convertAndSend(eq("/topic/room/123"), any(ChatMessage.class));
        verify(javaExecutor, never()).execute(anyMap());
    }

    @Test
    void executeAsync_ExceptionThrown_SendsErrorMessage() throws Exception {
        ExecuteCodeRequest request = new ExecuteCodeRequest(Map.of("Main.java", "public class Main {}"), "java", "123");
        
        when(javaExecutor.execute(anyMap())).thenThrow(new RuntimeException("Docker error"));
        when(objectMapper.writeValueAsString(any())).thenReturn("{\"stderr\":\"Docker error\"}");

        executionService.executeAsync(request, "test@test.com");

        verify(simpMessagingTemplate, times(2)).convertAndSend(eq("/topic/room/123"), any(ChatMessage.class));
    }
}
