package com.petcare.petwellness.Util;

import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.InvalidPathException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@Component
public class FileStorageUtil {

    
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String subFolder) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Uploaded file is missing or empty");
        }

        String originalName = file.getOriginalFilename();
        if (originalName == null || originalName.trim().isEmpty()) {
            throw new BadRequestException("Uploaded file name is invalid");
        }

        String safeFileName = originalName.replaceAll("[\\\\/:*?\"<>|]", "_");
        String uniqueFileName = UUID.randomUUID() + "_" + safeFileName;

        Path folderPath = Paths.get(uploadDir, subFolder);
        try {
            Files.createDirectories(folderPath);
        } catch (IOException e) {
            throw new RuntimeException("Unable to create upload directory: " + folderPath, e);
        }

        Path destination = folderPath.resolve(uniqueFileName);
        try {
            file.transferTo(destination.toFile());
            return destination.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new RuntimeException("File saving failed at path: " + destination.toAbsolutePath(), e);
        }
    }

    public void deleteFileQuietly(String absolutePath) {
        if (absolutePath == null || absolutePath.isBlank()) {
            return;
        }

        try {
            Files.deleteIfExists(Paths.get(absolutePath));
        } catch (IOException | InvalidPathException ignored) {
            // Best-effort cleanup; upload/update should not fail due to old-file deletion.
        }
    }
}

