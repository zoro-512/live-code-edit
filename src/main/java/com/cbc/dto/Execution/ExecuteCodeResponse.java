package com.cbc.dto.Execution;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ExecuteCodeResponse {

    private     String stdout;
    private      String stderr;
    private     Integer exitCode;
    private     Long executionTime;



}
