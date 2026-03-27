package com.petcare.petwellness.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByAppointmentDateAndStartTime(LocalDate appointmentDate, LocalTime startTime);
    boolean existsByAppointmentDateAndStartTimeAndIdNot(LocalDate appointmentDate, LocalTime startTime, Long id);

    List<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    List<Appointment> findByUserIdAndStatus(Long userId, AppointmentStatus status, Pageable pageable);
}
