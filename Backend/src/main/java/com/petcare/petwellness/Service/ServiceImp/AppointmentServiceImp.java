package com.petcare.petwellness.Service.ServiceImp;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.petcare.petwellness.DTO.Request.AppointmentCreateRequestDto;
import com.petcare.petwellness.DTO.Request.AppointmentUpdateRequestDto;
import com.petcare.petwellness.DTO.Response.AppointmentResponseDto;
import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Domain.Entity.Pet;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;
import com.petcare.petwellness.Repository.AppointmentRepository;
import com.petcare.petwellness.Repository.PetRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.AppointmentService;
import com.petcare.petwellness.Service.EmailService;

@Service
public class AppointmentServiceImp implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final UserRepository userRepository;
    private final PetRepository petRepository;
    private final EmailService emailService;

    public AppointmentServiceImp(AppointmentRepository appointmentRepository,
            UserRepository userRepository,
            PetRepository petRepository,
            EmailService emailService) {
        this.appointmentRepository = appointmentRepository;
        this.userRepository = userRepository;
        this.petRepository = petRepository;
        this.emailService = emailService;
    }

    @Override
    @Transactional
    public AppointmentResponseDto createAppointment(AppointmentCreateRequestDto request) {
        LocalDate appointmentDate = request.getAppointmentDate();
        LocalTime startTime = request.getStartTime();
        LocalTime endTime = request.getEndTime();

        validateTimeRange(startTime, endTime);

        if (appointmentRepository.existsByAppointmentDateAndStartTime(appointmentDate, startTime)) {
            throw new BadRequestException("Appointment slot already exists for this date and start time");
        }

        Appointment appointment = new Appointment();
        appointment.setAppointmentDate(appointmentDate);
        appointment.setStartTime(startTime);
        appointment.setEndTime(endTime);
        appointment.setVeterinarianName(request.getVeterinarianName().trim());
        appointment.setAppointmentType(request.getAppointmentType());

      
        Appointment saved = appointmentRepository.save(appointment);
        return mapToDto(saved);
    }

    @Override
    @Transactional
    public AppointmentResponseDto updateAppointment(Long appointmentId, AppointmentUpdateRequestDto request) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        LocalDate nextDate = request.getAppointmentDate() != null ? request.getAppointmentDate()
                : appointment.getAppointmentDate();
        LocalTime nextStart = request.getStartTime() != null ? request.getStartTime() : appointment.getStartTime();
        LocalTime nextEnd = request.getEndTime() != null ? request.getEndTime() : appointment.getEndTime();

        validateTimeRange(nextStart, nextEnd);

        boolean slotChanged = !nextDate.equals(appointment.getAppointmentDate())
                || !nextStart.equals(appointment.getStartTime());

        if (slotChanged && appointmentRepository.existsByAppointmentDateAndStartTimeAndIdNot(nextDate, nextStart, appointmentId)) {
            throw new BadRequestException("Appointment slot already exists for this date and start time");
        }

        if (request.getAppointmentDate() != null) {
            appointment.setAppointmentDate(request.getAppointmentDate());
        }

        if (request.getStartTime() != null) {
            appointment.setStartTime(request.getStartTime());
        }

        if (request.getEndTime() != null) {
            appointment.setEndTime(request.getEndTime());
        }

        String veterinarianName = trimToNull(request.getVeterinarianName());
        if (veterinarianName != null) {
            appointment.setVeterinarianName(veterinarianName);
        }

        if (request.getAppointmentType() != null) {
            appointment.setAppointmentType(request.getAppointmentType());
        }

        if (request.getStatus() != null) {
            appointment.setStatus(request.getStatus());
        }

        Appointment saved = appointmentRepository.save(appointment);
        return mapToDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AppointmentResponseDto getAppointmentById(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        return mapToDto(appointment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAppointments(int offset, int limit) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "appointmentDate").and(Sort.by(Sort.Direction.ASC, "startTime"))
        );

        return appointmentRepository.findAll(pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getBookedAppointments(int offset, int limit) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.DESC, "appointmentDate").and(Sort.by(Sort.Direction.ASC, "startTime"))
        );

        return appointmentRepository.findByStatus(AppointmentStatus.BOOKED, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getAvailableAppointments(int offset, int limit) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.ASC, "appointmentDate").and(Sort.by(Sort.Direction.ASC, "startTime"))
        );

        return appointmentRepository.findByStatus(AppointmentStatus.AVAILABLE, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AppointmentResponseDto> getUserBookedAppointments(Long userId, int offset, int limit) {
        validatePagination(offset, limit);

        PageRequest pageable = PageRequest.of(
                offset,
                limit,
                Sort.by(Sort.Direction.ASC, "appointmentDate").and(Sort.by(Sort.Direction.ASC, "startTime"))
        );

        return appointmentRepository.findByUserIdAndStatus(userId, AppointmentStatus.BOOKED, pageable)
                .stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public String deleteAppointment(Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));
        appointmentRepository.delete(appointment);
        return "Appointment deleted successfully";
    }

    @Override
    @Transactional
    public AppointmentResponseDto bookAppointment(Long appointmentId, Long petId, Long userId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found"));

        if (appointment.getStatus() != AppointmentStatus.AVAILABLE) {
            throw new BadRequestException("Appointment slot is not available");
        }

        if (appointment.getUser() != null || appointment.getPet() != null) {
            throw new BadRequestException("Appointment slot is already booked");
        }

        Pet pet = petRepository.findById(petId)
                .orElseThrow(() -> new ResourceNotFoundException("Pet not found"));

        Long ownerId = pet.getUser() != null ? pet.getUser().getId() : null;
        if (ownerId == null || !ownerId.equals(userId)) {
            throw new UnauthorizedException("You are not authorized to book for this pet");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        appointment.setPet(pet);
        appointment.setUser(user);
        appointment.setStatus(AppointmentStatus.BOOKED);

        Appointment saved = appointmentRepository.save(appointment);
        sendBookingConfirmationEmail(user, pet, saved);
        return mapToDto(saved);
    }

    private AppointmentResponseDto mapToDto(Appointment appointment) {
        AppointmentResponseDto dto = new AppointmentResponseDto();
        dto.setId(appointment.getId());
        dto.setAppointmentDate(appointment.getAppointmentDate());
        dto.setStartTime(appointment.getStartTime());
        dto.setEndTime(appointment.getEndTime());
        dto.setVeterinarianName(appointment.getVeterinarianName());
        dto.setAppointmentType(appointment.getAppointmentType());
        dto.setStatus(appointment.getStatus());
        dto.setCreatedAt(appointment.getCreatedAt());
        dto.setUserId(appointment.getUser() != null ? appointment.getUser().getId() : null);
        dto.setPetId(appointment.getPet() != null ? appointment.getPet().getId() : null);
        return dto;
    }

    private String trimToNull(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private void validateTimeRange(LocalTime startTime, LocalTime endTime) {
        if (startTime == null || endTime == null) {
            throw new BadRequestException("Start time and end time are required");
        }
        if (!startTime.isBefore(endTime)) {
            throw new BadRequestException("Start time must be before end time");
        }
    }

    private void sendBookingConfirmationEmail(User user, Pet pet, Appointment appointment) {
        String recipient = user.getEmail();
        if (recipient == null || recipient.isBlank()) {
            return;
        }

        String greetingName = trimToNull(user.getFirstName());
        if (greetingName == null) {
            greetingName = trimToNull(user.getFullName());
        }
        if (greetingName == null) {
            greetingName = "there";
        }

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        String subject = "Appointment Booked - Pet Wellness";
        String body = "Hi " + greetingName + ",\n\n"
                + "Your appointment has been booked successfully.\n\n"
                + "Appointment ID: " + appointment.getId() + "\n"
                + "Date: " + appointment.getAppointmentDate().format(dateFormatter) + "\n"
                + "Time: " + appointment.getStartTime().format(timeFormatter)
                + " - " + appointment.getEndTime().format(timeFormatter) + "\n"
                + "Veterinarian: " + appointment.getVeterinarianName() + "\n"
                + "Type: " + appointment.getAppointmentType() + "\n"
                + "Pet: " + (pet != null ? pet.getName() : "N/A") + "\n\n"
                + "If you need to reschedule or cancel, please contact support.\n\n"
                + "Thank you,\nPet Wellness Team";

        emailService.sendEmail(recipient, subject, body);
    }
}
