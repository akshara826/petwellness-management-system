package com.petcare.petwellness.Service;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import java.util.List;

public interface AdminService {

    List<PendingUserResponseDto> getPendingUsers();

    String approveUser(Long userId);

    void createOwner(AdminCreateOwnerRequestDto request);

}
