package com.petcare.petwellness.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;

import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Enums.AppointmentStatus;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {
    boolean existsByAppointmentDateAndStartTime(LocalDate appointmentDate, LocalTime startTime);
    boolean existsByAppointmentDateAndStartTimeAndIdNot(LocalDate appointmentDate, LocalTime startTime, Long id);

    List<Appointment> findByStatus(AppointmentStatus status, Pageable pageable);

    List<Appointment> findByUserIdAndStatus(Long userId, AppointmentStatus status, Pageable pageable);

    @Query("""
            select a from Appointment a
            where a.status = :status
              and (
                   a.appointmentDate > :today
                   or (a.appointmentDate = :today and a.startTime > :nowTime)
              )
            """)
    List<Appointment> findFutureByStatus(
            @Param("status") AppointmentStatus status,
            @Param("today") LocalDate today,
            @Param("nowTime") LocalTime nowTime,
            Pageable pageable);

    @Modifying
    @Query("""
            update Appointment a
               set a.status = :invalidStatus
             where a.status in :candidateStatuses
               and (
                    a.appointmentDate < :today
                    or (a.appointmentDate = :today and a.startTime <= :nowTime)
               )
            """)
    int markPastSlotsInvalid(
            @Param("candidateStatuses") List<AppointmentStatus> candidateStatuses,
            @Param("invalidStatus") AppointmentStatus invalidStatus,
            @Param("today") LocalDate today,
            @Param("nowTime") LocalTime nowTime);
}
