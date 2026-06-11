package com.cbc.dto.Execution;

import lombok.Data;
@Data
public class Judge0SubmissionResponse {


    private String stdout;

    private String stderr;

    private String compile_output;

    private Status status;

    @Data
    public static class Status {
        private String description;
    }
}