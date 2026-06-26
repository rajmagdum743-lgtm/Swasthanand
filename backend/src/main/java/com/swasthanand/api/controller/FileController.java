package com.swasthanand.api.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.http.codec.multipart.FilePart;
import org.springframework.web.bind.annotation.*;
import org.springframework.util.StringUtils;
import reactor.core.publisher.Mono;
import java.io.IOException;
import java.nio.file.*;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
public class FileController {

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
    public Mono<ResponseEntity<Object>> uploadFile(
            @RequestPart("file") FilePart filePart,
            @RequestParam("productName") String productName) {
        
        String originalFilename = StringUtils.cleanPath(filePart.filename());
        if (originalFilename.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body((Object) Map.of("message", "File is empty")));
        }

        String extension = "";
        int i = originalFilename.lastIndexOf('.');
        if (i > 0) {
            extension = originalFilename.substring(i + 1);
        }
        if (extension.isEmpty()) extension = "pdf";

        // Sanitize product name: replace non-alphanumeric with underscores
        String sanitizedName = productName.replaceAll("[^a-zA-Z0-9]", "_");
        String filename = sanitizedName + "_Swasthanand." + extension;
        Path targetPath = this.root.resolve(filename);

        return filePart.transferTo(targetPath)
                .then(Mono.fromCallable(() -> {
                    String fileUrl = "http://localhost:8080/api/files/" + filename;
                    return ResponseEntity.ok((Object) Map.of("url", fileUrl, "filename", filename));
                }))
                .onErrorResume(e -> Mono.just(ResponseEntity.internalServerError().body((Object) Map.of("message", "Could not upload the file: " + e.getMessage()))));
    }
}
