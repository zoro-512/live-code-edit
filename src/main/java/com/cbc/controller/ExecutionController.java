package com.cbc.controller;

import com.cbc.dto.Execution.ExecuteCodeRequest;
import com.cbc.dto.Execution.ExecuteCodeResponse;
import com.cbc.service.ExecutionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/execute")
public class ExecutionController {
    @Autowired
    private ExecutionService judge0Service;

    @PostMapping("/execute")
    public ResponseEntity<ExecuteCodeResponse> execute(
            @RequestBody ExecuteCodeRequest request
    ) {
        return ResponseEntity.ok(
                judge0Service.execute(request)
        );
    }

}
