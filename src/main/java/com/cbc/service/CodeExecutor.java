package com.cbc.service;

import com.cbc.dto.execution.ExecuteCodeResponse;

public interface CodeExecutor {
    ExecuteCodeResponse execute(String code);
}
