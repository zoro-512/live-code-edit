package com.cbc.service;

import com.cbc.dto.Execution.ExecuteCodeResponse;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.concurrent.TimeUnit;

@Service
public class JavaExecutor implements CodeExecutor {

    @Override
    public ExecuteCodeResponse execute(String code) {
        Path tempDir = null;
        try {
            tempDir = Files.createTempDirectory("execution");
            Path javaFile = tempDir.resolve("Main.java");

            Files.writeString(
                    javaFile,
                    code,
                    StandardCharsets.UTF_8
            );

            String hostPath = tempDir.toAbsolutePath().toString();
            ProcessBuilder dockerBuilder =
                    new ProcessBuilder(
                            "docker",
                            "run",
                            "--rm",
                            "--memory=128m",
                            "--cpus=1",
                            "--network=none",
                            "-v",
                            hostPath + ":/app",
                            "java-runner",
                            "sh",
                            "-c",
                            "javac Main.java && java Main"
                    );
            Path stdoutFile = tempDir.resolve("stdout.txt");

            Path stderrFile = tempDir.resolve("stderr.txt");

            dockerBuilder.redirectOutput(
                    stdoutFile.toFile()
            );

            dockerBuilder.redirectError(
                    stderrFile.toFile()
            );
            long startTime =
                    System.currentTimeMillis();

            Process process =
                    dockerBuilder.start();

            boolean finished =
                    process.waitFor(
                            5,
                            TimeUnit.SECONDS
                    );

            long executionTime =
                    System.currentTimeMillis()
                            - startTime;

            if (!finished) {

                process.destroyForcibly();

                return ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr("Execution timed out")
                        .exitCode(-1)
                        .executionTime(executionTime)
                        .build();
            }

            String stdout =  Files.readString(stdoutFile);

            String stderr = Files.readString(stderrFile);

            int exitCode = process.exitValue();
            return  new ExecuteCodeResponse(stdout,stderr,exitCode,executionTime);
        } catch (Exception e) {
            throw new RuntimeException(e);
        } finally {
            if (tempDir != null) {
                deleteDirectory(tempDir);
            }
        }
    }

    private void deleteDirectory(Path path) {
        try {
            if (Files.exists(path)) {
                try (var walk = Files.walk(path)) {
                    walk.sorted(java.util.Comparator.reverseOrder())
                        .map(Path::toFile)
                        .forEach(java.io.File::delete);
                }
            }
        } catch (IOException e) {

        }
    }
}