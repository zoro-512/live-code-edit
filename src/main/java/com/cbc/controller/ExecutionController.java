package com.cbc.controller;

import com.cbc.dto.execution.ExecuteCodeRequest;
import com.cbc.service.ExecutionService;
import com.cbc.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/execute")
@RequiredArgsConstructor
public class ExecutionController {

    private final ExecutionService executionService;
    private final RoomService roomService;

    @PostMapping("/run")
    public ResponseEntity<Void> execute(@RequestBody ExecuteCodeRequest request, Authentication authentication) {
        roomService.validateRoomMembership(authentication.getName(), Long.parseLong(request.roomId()));
        executionService.executeAsync(request, authentication.getName());
        return ResponseEntity.accepted().build();
    }

}

