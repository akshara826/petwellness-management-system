package com.petcare.petwellness.Service;

import java.util.List;

import com.petcare.petwellness.DTO.Request.AppointmentCreateRequestDto;
import com.petcare.petwellness.DTO.Request.AppointmentUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.AppointmentResponseDto;

public interface AppointmentService {

    AppointmentResponseDto createAppointment(AppointmentCreateRequestDto request);

    AppointmentResponseDto updateAppointment(Long appointmentId, AppointmentUpdateRequestDto request);

    AppointmentResponseDto getAppointmentById(Long appointmentId);

    List<AppointmentResponseDto> getAppointments(int offset, int limit);

    List<AppointmentResponseDto> getBookedAppointments(int offset, int limit);

    List<AppointmentResponseDto> getAvailableAppointments(int offset, int limit);

    List<AppointmentResponseDto> getUserBookedAppointments(Long userId, int offset, int limit);

    String deleteAppointment(Long appointmentId);

    AppointmentResponseDto bookAppointment(Long appointmentId, Long petId, Long userId);
}
