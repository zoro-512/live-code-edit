package com.cbc.controller;

import com.cbc.dto.Execution.ExecuteCodeRequest;
import com.cbc.service.ExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/execute")
public class ExecutionController {
    @Autowired
    private ExecutionService ex;

    @PostMapping("/execute")
    public ResponseEntity<Void> execute(@RequestBody ExecuteCodeRequest request,Authentication authentication) {
        ex.executeAsync(request, authentication.getName());
        return ResponseEntity.accepted().build();
    }

}
