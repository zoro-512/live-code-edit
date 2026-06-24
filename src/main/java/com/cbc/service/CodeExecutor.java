package com.cbc.service;

import com.cbc.dto.execution.ExecuteCodeResponse;
import java.util.Map;

public interface CodeExecutor {
    ExecuteCodeResponse execute(Map<String, String> files);
}
