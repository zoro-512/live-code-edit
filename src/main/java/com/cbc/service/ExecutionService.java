package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeRequest;
import com.cbc.dto.Execution.ExecuteCodeResponse;
import org.springframework.stereotype.Service;

@Service
public class ExecutionService {

    private  JavaExecutor javaExecutor;



    public ExecuteCodeResponse execute(ExecuteCodeRequest request) {

        if(request.getLanguage().contentEquals("java")){
            return javaExecutor.execute(request.getSourceCode());
        }
        return new ExecuteCodeResponse("hello","",1,1L);

    }
    
}
