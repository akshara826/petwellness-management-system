package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.ProfileCompletionRequestDto;
import org.springframework.web.multipart.MultipartFile;

public interface RegistrationService {

    void completeProfile(
            ProfileCompletionRequestDto request,
            MultipartFile idProof,
            MultipartFile profileImage);
}
