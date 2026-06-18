package com.cbc.dto.execution;

public record ExecuteCodeRequest(
    String sourceCode,
    String language,
    String roomId
) {}
