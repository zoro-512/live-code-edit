package com.cbc.dto.execution;

import lombok.Builder;

@Builder
public record ExecuteCodeResponse(
    String stdout,
    String stderr,
    Integer exitCode,
    Long executionTime
) {}
