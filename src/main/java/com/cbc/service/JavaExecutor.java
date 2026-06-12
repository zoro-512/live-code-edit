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

            Path compileStderrFile = tempDir.resolve("compile_stderr.txt");

            ProcessBuilder compileBuilder = new ProcessBuilder("javac", "Main.java");
            compileBuilder.directory(tempDir.toFile());
            compileBuilder.redirectError(compileStderrFile.toFile());

            Process compileProcess = compileBuilder.start();
            boolean compileFinished = compileProcess.waitFor(10, TimeUnit.SECONDS);
            if (!compileFinished) {
                compileProcess.destroyForcibly();
                return ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr("Compilation timed out.")
                        .exitCode(-1)
                        .executionTime(0L)
                        .build();
            }

            int compileExitCode = compileProcess.exitValue();
            if (compileExitCode != 0) {
                String compileError = Files.readString(compileStderrFile, StandardCharsets.UTF_8);
                return ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr(compileError)
                        .exitCode(compileExitCode)
                        .executionTime(0L)
                        .build();
            }

            Path runStdoutFile = tempDir.resolve("run_stdout.txt");
            Path runStderrFile = tempDir.resolve("run_stderr.txt");

            ProcessBuilder runBuilder = new ProcessBuilder("java", "Main");
            runBuilder.directory(tempDir.toFile());
            runBuilder.redirectOutput(runStdoutFile.toFile());
            runBuilder.redirectError(runStderrFile.toFile());

            long startTime = System.currentTimeMillis();
            Process runProcess = runBuilder.start();
            boolean runFinished = runProcess.waitFor(5, TimeUnit.SECONDS);
            long endTime = System.currentTimeMillis();
            long executionTime = endTime - startTime;

            if (!runFinished) {
                runProcess.destroyForcibly();
                return ExecuteCodeResponse.builder()
                        .stdout("")
                        .stderr("Execution timed out (5-second limit exceeded).")
                        .exitCode(-1)
                        .executionTime(executionTime)
                        .build();
            }

            int exitCode = runProcess.exitValue();
            String stdout = Files.readString(runStdoutFile, StandardCharsets.UTF_8);
            String stderr = Files.readString(runStderrFile, StandardCharsets.UTF_8);

            return ExecuteCodeResponse.builder()
                    .stdout(stdout)
                    .stderr(stderr)
                    .exitCode(exitCode)
                    .executionTime(executionTime)
                    .build();

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