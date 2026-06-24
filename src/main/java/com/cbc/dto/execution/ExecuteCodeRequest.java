package com.cbc.dto.execution;

import java.util.Map;

public record ExecuteCodeRequest(
    Map<String, String> files,
    String language,
    String roomId
) {}
