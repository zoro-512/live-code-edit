package com.cbc.dto.Execution;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExecuteCodeRequest {
    private String sourceCode;
    private String language;
    private String roomId;
}
