package com.petcare.petwellness.Util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.UUID;


@Component
public class FileStorageUtil {

    
    @Value("${file.upload-dir}")
    private String uploadDir;

    public String saveFile(MultipartFile file, String subFolder) {

    try {

        File folder = new File(uploadDir + File.separator + subFolder);

        if (!folder.exists()) {
            folder.mkdirs();
        }

        String uniqueFileName = UUID.randomUUID() + "_" + file.getOriginalFilename();

        File destination = new File(folder, uniqueFileName);

        file.transferTo(destination);

        return destination.getAbsolutePath();

    } catch (IOException e) {

        throw new RuntimeException("File saving failed", e);
    }
}

}

