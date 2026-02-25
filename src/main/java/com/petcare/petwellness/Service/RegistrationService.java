package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.ProfileCompletionRequestDto;
import com.petcare.petwellness.DTO.Response.LoginResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface RegistrationService {

    LoginResponseDto completeProfile(
            ProfileCompletionRequestDto request,
            MultipartFile idProof,
            MultipartFile profileImage);
}
