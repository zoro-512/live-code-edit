package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeResponse;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

@Service
public class JavaExecutor implements CodeExecutor {

    @Override
    public ExecuteCodeResponse execute(String code) {
        Path tempDir;
        try {
            tempDir = Files.createTempDirectory("execution");
            Path javaFile = tempDir.resolve("Main.java");

            Files.writeString(
                    javaFile,
                    code,
                    StandardCharsets.UTF_8
            );
            ProcessBuilder compileBuilder =
                    new ProcessBuilder(
                            "javac",
                            "Main.java"
                    );

            compileBuilder.directory(
                    tempDir.toFile()
            );


            Process compileProcess =   compileBuilder.start();

            int compileExitCode =     compileProcess.waitFor();

            String compileError =
                    new String(
                            compileProcess
                                    .getErrorStream()
                                    .readAllBytes()
                    );
            ProcessBuilder runBuilder =
                    new ProcessBuilder(
                            "java",
                            "Main"
                    );

            runBuilder.directory(
                    tempDir.toFile()
            );
            Process runProcess =
                    runBuilder.start();
            String stdout =
                    new String(
                            runProcess
                                    .getInputStream()
                                    .readAllBytes()
                    );

            String stderr =
                    new String(
                            runProcess
                                    .getErrorStream()
                                    .readAllBytes()
                    );
            int exitCode =
                    runProcess.waitFor();
            return ExecuteCodeResponse.builder()
                    .stdout(stdout)
                    .stderr(stderr)
                    .exitCode(exitCode)
                    .build();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }


    }
}