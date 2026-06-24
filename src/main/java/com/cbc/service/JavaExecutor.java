package com.cbc.service;

import com.cbc.dto.execution.ExecuteCodeResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import java.util.Map;

@Slf4j
@Service
public class JavaExecutor implements CodeExecutor {

    @Value("${execution.container-path:}")
    private String containerPath;

    @Value("${execution.host-path:}")
    private String hostPathConfig;

    @Override
    public ExecuteCodeResponse execute(Map<String, String> files) {
        Path tempDir = null;
        try {
            String uuid = UUID.randomUUID().toString();
            
            if (containerPath != null && !containerPath.trim().isEmpty()) {
                tempDir = Paths.get(containerPath, uuid);
                Files.createDirectories(tempDir);
            } else {
                tempDir = Files.createTempDirectory("execution-" + uuid);
            }

            for (Map.Entry<String, String> entry : files.entrySet()) {
                Path javaFile = tempDir.resolve(entry.getKey());
                Files.createDirectories(javaFile.getParent());
                Files.writeString(
                        javaFile,
                        entry.getValue(),
                        StandardCharsets.UTF_8
                );
            }

            String containerName = "exec-" + uuid;

            String hostPath;
            if (hostPathConfig != null && !hostPathConfig.trim().isEmpty()) {
                hostPath = hostPathConfig + "/" + uuid;
            } else {
                hostPath = tempDir.toAbsolutePath().toString().replace('\\', '/');
            }

            ProcessBuilder dockerBuilder =
                    new ProcessBuilder(
                            "docker",
                            "run",
                            "--rm",
                            "--name",
                            containerName,
                            "--memory=128m",
                            "--cpus=1",
                            "--network=none",
                            "--user", "nobody",
                            "-v",
                            hostPath + ":/app",
                            "java-runner",
                            "sh",
                            "-c",
                            "find . -name '*.java' > sources.txt && javac @sources.txt && java Main"
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
                new ProcessBuilder(
                        "docker",
                        "kill",
                        containerName
                ).start().waitFor();
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
            log.warn("Failed to delete temp execution directory {}: {}", path, e.getMessage());
        }
    }
}