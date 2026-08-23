package com.swasthanand.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;
import java.util.UUID;

import org.springframework.security.access.prepost.PreAuthorize;
import java.util.Set;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of("pdf", "jpg", "jpeg", "png", "webp");

    @org.springframework.beans.factory.annotation.Value("${server.port:8081}")
    private String serverPort;

    private final Path root = Paths.get("uploads");

    public FileController() {
        try {
            if (!Files.exists(root)) {
                Files.createDirectory(root);
            }
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize folder for upload!");
        }
    }

    @PostMapping("/upload")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEALER')")
    public Mono<ResponseEntity<Object>> uploadFile(
            @RequestPart("file") FilePart filePart,
            @RequestParam(value = "productName", required = false) String productName,
            @RequestParam(value = "prefix", required = false) String prefix) {
        
        String originalFilename = StringUtils.cleanPath(filePart.filename());
        if (originalFilename.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "File is empty")));
        }

        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i + 1).toLowerCase();
        }
        if (extension.isEmpty() || !ALLOWED_EXTENSIONS.contains(extension)) {
            return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "Unsupported file type. Allowed types: pdf, jpg, jpeg, png, webp")));
        }

        String baseName = "doc";
        if (productName != null && !productName.isBlank()) {
            baseName = productName.replaceAll("[^a-zA-Z0-9]", "_");
        } else if (prefix != null && !prefix.isBlank()) {
            baseName = prefix.replaceAll("[^a-zA-Z0-9]", "_");
        }

        String uniqueFilename = baseName + "_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 6) + "." + extension;
        Path targetPath = this.root.resolve(uniqueFilename);

        return filePart.transferTo(targetPath)
                .then(Mono.fromCallable(() -> {
                    String fileUrl = "http://localhost:" + serverPort + "/api/files/" + uniqueFilename;
                    return ResponseEntity.ok((Object) Map.of(
                            "url", fileUrl,
                            "filename", uniqueFilename,
                            "originalFilename", originalFilename
                    ));
                }))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().body((Object) Map.of("message", "Could not upload the file: " + e.getMessage()))));
    }
}
