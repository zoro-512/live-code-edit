package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeResponse;

public interface CodeExecutor {
    ExecuteCodeResponse execute(String code);
}
