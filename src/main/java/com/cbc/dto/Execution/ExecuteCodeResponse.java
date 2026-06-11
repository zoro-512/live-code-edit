package com.cbc.dto.Execution;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ExecuteCodeResponse {

    private     String stdout;
    private      String stderr;
    private     Integer exitCode;
    private     Long executionTime;
}
