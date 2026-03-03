package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.UpdateProfileRequestDto;
import com.petcare.petwellness.DTO.Response.ProfileResponseDto;
import org.springframework.web.multipart.MultipartFile;

public interface ProfileService {
    ProfileResponseDto getMyProfile(String email);

    void updateMyProfile(String email, UpdateProfileRequestDto request, MultipartFile profileImage);
}
