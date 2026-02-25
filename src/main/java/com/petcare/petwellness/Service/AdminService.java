package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminService {

    List<PendingUserResponseDto> getPendingUsers();

    List<ApprovedUserResponseDto> getApprovedUsers();

    AdminUserProfileResponseDto getUserProfile(Long userId);

    String approveUser(Long userId);

    String rejectUser(Long userId, String rejectionReason);

    String deleteApprovedUser(Long userId, String deletionReason, String requestedByEmail);

    void createOwner(AdminCreateOwnerRequestDto request, MultipartFile idProof, MultipartFile profileImage);

}
