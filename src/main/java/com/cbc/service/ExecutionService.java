package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeRequest;
import com.cbc.dto.Execution.ExecuteCodeResponse;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    public ExecuteCodeResponse execute(ExecuteCodeRequest request) {
        return new ExecuteCodeResponse("hello","",1,1L);

    }


//    private String createSubmission(
//            ExecuteCodeRequest request
//    ){
//        return
//    }
//
}
