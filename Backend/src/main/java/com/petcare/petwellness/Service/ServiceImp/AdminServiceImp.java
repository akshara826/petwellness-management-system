package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.DTO.Request.AdminCreateOwnerRequestDto;
import com.petcare.petwellness.DTO.Response.AdminDashboardResponseDto;
import com.petcare.petwellness.DTO.Response.AdminUserProfileResponseDto;
import com.petcare.petwellness.DTO.Response.ApprovedUserResponseDto;
import com.petcare.petwellness.DTO.Response.DashboardActivityItemDto;
import com.petcare.petwellness.DTO.Response.DashboardAppointmentPointDto;
import com.petcare.petwellness.DTO.Response.DashboardRegistrationPointDto;
import com.petcare.petwellness.DTO.Response.PendingUserResponseDto;
import com.petcare.petwellness.Domain.Entity.Appointment;
import com.petcare.petwellness.Domain.Entity.Product;
import com.petcare.petwellness.Domain.Entity.Address;
import com.petcare.petwellness.Domain.Entity.PersonalInfo;
import com.petcare.petwellness.Domain.Entity.User;
import com.petcare.petwellness.Enums.AppointmentStatus;
import com.petcare.petwellness.Enums.ProductStatus;
import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Repository.AppointmentRepository;
import com.petcare.petwellness.Repository.PersonalInfoRepository;
import com.petcare.petwellness.Repository.ProductRepository;
import com.petcare.petwellness.Repository.AddressRepository;
import com.petcare.petwellness.Repository.UserRepository;
import com.petcare.petwellness.Service.AdminService;
import com.petcare.petwellness.Service.EmailService;
import com.petcare.petwellness.Util.FileStorageUtil;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.List;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;


@Service
public class AdminServiceImp implements AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final PersonalInfoRepository personalInfoRepository;
    private final AddressRepository addressRepository;
    private final FileStorageUtil fileStorageUtil;
    private final AppointmentRepository appointmentRepository;
    private final ProductRepository productRepository;


    public AdminServiceImp(UserRepository userRepository, PasswordEncoder passwordEncoder, EmailService emailService,
            PersonalInfoRepository personalInfoRepository, AddressRepository addressRepository,
            FileStorageUtil fileStorageUtil, AppointmentRepository appointmentRepository,
            ProductRepository productRepository) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.personalInfoRepository = personalInfoRepository;
        this.addressRepository = addressRepository;
        this.fileStorageUtil = fileStorageUtil;
        this.appointmentRepository = appointmentRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardResponseDto getDashboardOverview() {
        List<User> ownerUsers = userRepository.findByRole(UserRole.OWNER);
        List<User> pendingUsers = ownerUsers.stream()
                .filter(user -> user.getStatus() == UserStatus.PENDING && user.isProfileCompleted())
                .collect(Collectors.toList());
        List<Appointment> bookedAppointments = appointmentRepository.findAll().stream()
                .filter(appointment -> appointment.getStatus() == AppointmentStatus.BOOKED)
                .collect(Collectors.toList());
        List<Product> products = productRepository.findAll();

        AdminDashboardResponseDto dto = new AdminDashboardResponseDto();
        dto.setTotalRegisteredUsers(ownerUsers.size());
        dto.setPendingApprovalRequests(pendingUsers.size());
        dto.setAppointmentsBooked(bookedAppointments.size());
        dto.setMarketplaceListings(products.size());
        dto.setRegistrationTrend(buildRegistrationTrend(ownerUsers));
        dto.setWeeklyAppointments(buildWeeklyAppointments(bookedAppointments));
        dto.setRecentActivities(buildRecentActivities(ownerUsers, bookedAppointments, products));
        return dto;
    }

    
    @Override
    public List<PendingUserResponseDto> getPendingUsers(int offset, int limit) {
        validatePagination(offset, limit);

        List<User> users = userRepository
                .findByProfileCompletedTrueAndStatus(UserStatus.PENDING,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();

        return users.stream()
                .map(user -> new PendingUserResponseDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public List<ApprovedUserResponseDto> getApprovedUsers(int offset, int limit) {
        validatePagination(offset, limit);
        List<User> users = userRepository
                .findByRoleAndStatus(UserRole.OWNER, UserStatus.APPROVED,
                        PageRequest.of(offset, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();

        if (users.isEmpty()) {
            throw new ResourceNotFoundException("No approved user found");
        }

        return users.stream()
                .map(user -> new ApprovedUserResponseDto(
                        user.getId(),
                        user.getFullName(),
                        user.getEmail(),
                        user.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }

    @Override
    public AdminUserProfileResponseDto getUserProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        PersonalInfo personalInfo = personalInfoRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Personal info not found for user"));

        Address address = addressRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found for user"));

        return new AdminUserProfileResponseDto(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                user.getFirstName(),
                personalInfo.getPhoneNumber(),
                personalInfo.getGender(),
                personalInfo.getHighestQualification(),
                personalInfo.getOccupation(),
                personalInfo.getFatherName(),
                personalInfo.getMotherName(),
                personalInfo.getDateOfBirth(),
                address.getStreet(),
                address.getCity(),
                address.getState(),
                address.getPincode(),
                user.getProfileImagePath(),
                user.getIdProofType(),
                user.getIdProofPath(),
                user.getCreatedAt()
        );
    }

    
   @Override
public String approveUser(Long userId) {

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("User already approved");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("Rejected user cannot be approved directly");
    }

    
    String tempPassword = "Temp" + System.currentTimeMillis() % 10000;


   
    user.setPassword(passwordEncoder.encode(tempPassword));

    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

   
    emailService.sendEmail(
            user.getEmail(),
            "Account Approved - Pet Wellness",
            "Your account is approved.\n\n" +
            "Temporary Password: " + tempPassword +
            "\n\nPlease login and set new password."
    );

    return "User approved and approval email sent.";
}

@Override
@Transactional
public String rejectUser(Long userId, String rejectionReason) {

    String reason = rejectionReason == null ? "" : rejectionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Rejection reason is required");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getStatus() == UserStatus.APPROVED) {
        throw new RuntimeException("Approved user cannot be rejected");
    }
    if (user.getStatus() == UserStatus.REJECTED) {
        throw new RuntimeException("User already rejected");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Rejected - Pet Wellness",
            "Your account request has been rejected.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "User rejected, rejection email sent, and user removed successfully.";
}

@Override
@Transactional
public String deleteApprovedUser(Long userId, String deletionReason, String requestedByEmail) {
    String reason = deletionReason == null ? "" : deletionReason.trim();
    if (reason.isEmpty()) {
        throw new RuntimeException("Deletion reason is required");
    }

    User requester = userRepository.findByEmail(requestedByEmail)
            .orElseThrow(() -> new RuntimeException("Authenticated admin not found"));

    if (requester.getId().equals(userId)) {
        throw new RuntimeException("Admin cannot delete its own account");
    }

    User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

    if (user.getRole() != UserRole.OWNER) {
        throw new RuntimeException("Only owner users can be deleted");
    }

    if (user.getStatus() != UserStatus.APPROVED) {
        throw new RuntimeException("Only approved users can be deleted");
    }

    emailService.sendEmail(
            user.getEmail(),
            "Account Deleted - Pet Wellness",
            "Your approved account has been deleted by Admin.\n\nReason: " + reason
    );

    addressRepository.deleteByUserId(user.getId());
    personalInfoRepository.deleteByUserId(user.getId());
    userRepository.delete(user);

    return "Approved user deleted successfully and deletion email sent.";
}

    @Override
    @Transactional
    public void createOwner(AdminCreateOwnerRequestDto request, MultipartFile idProof, MultipartFile profileImage) {

    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("User already exists");
    }

    if (request.getDateOfBirth() == null || !request.getDateOfBirth().isBefore(java.time.LocalDate.now())) {
        throw new BadRequestException("Date of birth must be a past date");
    }

   String tempPassword = "Temp" + System.currentTimeMillis() % 10000;

    String encodedPassword = passwordEncoder.encode(tempPassword);

    String fullName = request.getFullName().trim();
    String firstName = fullName.split("\\s+")[0];

    User user = new User();
    user.setEmail(request.getEmail());
    user.setFullName(fullName);
    user.setFirstName(firstName);
    user.setPassword(encodedPassword);
    user.setIdProofType(request.getIdProofType());

    String idProofPath;
    String profileImagePath;
    try {
        idProofPath = fileStorageUtil.saveFile(idProof, "id-proofs");
        profileImagePath = fileStorageUtil.saveFile(profileImage, "profile-images");
    } catch (RuntimeException ex) {
        throw new BadRequestException("File upload failed: " + ex.getMessage());
    }

    user.setIdProofPath(idProofPath);
    user.setProfileImagePath(profileImagePath);

    user.setRole(UserRole.OWNER);
    user.setEmailVerified(true);
    user.setProfileCompleted(true);
    user.setStatus(UserStatus.APPROVED);
    user.setRejectionReason(null);
    user.setFirstLogin(true);

    userRepository.save(user);

    PersonalInfo personalInfo = new PersonalInfo();
    personalInfo.setUser(user);
    personalInfo.setFullName(fullName);
    personalInfo.setPhoneNumber(request.getPhoneNumber());
    personalInfo.setGender(request.getGender());
    personalInfo.setHighestQualification(request.getHighestQualification());
    personalInfo.setOccupation(request.getOccupation());
    personalInfo.setFatherName(request.getFatherName());
    personalInfo.setMotherName(request.getMotherName());
    personalInfo.setDateOfBirth(request.getDateOfBirth());

    personalInfoRepository.save(personalInfo);

    Address address = new Address();
    address.setUser(user);
    address.setStreet(request.getStreet());
    address.setCity(request.getCity());
    address.setState(request.getState());
    address.setPincode(request.getPincode());

    addressRepository.save(address);

emailService.sendEmail(
        user.getEmail(),
        "Your Owner Account Created - Pet Wellness",
        "Your account has been created by Admin.\n\n" +
        "Temporary Password: " + tempPassword +
        "\n\nPlease login and set your new password."
);

}

    private void validatePagination(int offset, int limit) {
        if (offset < 0) {
            throw new BadRequestException("Offset must be >= 0");
        }
        if (limit <= 0) {
            throw new BadRequestException("Limit must be > 0");
        }
    }

    private List<DashboardRegistrationPointDto> buildRegistrationTrend(List<User> ownerUsers) {
        DateTimeFormatter monthFormatter = DateTimeFormatter.ofPattern("MMM");
        YearMonth currentMonth = YearMonth.now();
        Map<YearMonth, Long> cumulativeCounts = new LinkedHashMap<>();

        for (int index = 5; index >= 0; index--) {
            YearMonth month = currentMonth.minusMonths(index);
            LocalDateTime monthEnd = month.atEndOfMonth().atTime(23, 59, 59);
            long count = ownerUsers.stream()
                    .filter(user -> user.getCreatedAt() != null && !user.getCreatedAt().isAfter(monthEnd))
                    .count();
            cumulativeCounts.put(month, count);
        }

        return cumulativeCounts.entrySet().stream()
                .map(entry -> new DashboardRegistrationPointDto(
                        entry.getKey().format(monthFormatter),
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    private List<DashboardAppointmentPointDto> buildWeeklyAppointments(List<Appointment> bookedAppointments) {
        DateTimeFormatter weekFormatter = DateTimeFormatter.ofPattern("dd MMM");
        LocalDate currentWeekStart = LocalDate.now().with(TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY));
        Map<LocalDate, Long> weeklyCounts = new LinkedHashMap<>();

        for (int index = 5; index >= 0; index--) {
            LocalDate weekStart = currentWeekStart.minusWeeks(index);
            LocalDate weekEnd = weekStart.plusDays(6);
            long count = bookedAppointments.stream()
                    .filter(appointment -> appointment.getAppointmentDate() != null)
                    .filter(appointment -> !appointment.getAppointmentDate().isBefore(weekStart)
                            && !appointment.getAppointmentDate().isAfter(weekEnd))
                    .count();
            weeklyCounts.put(weekStart, count);
        }

        return weeklyCounts.entrySet().stream()
                .map(entry -> new DashboardAppointmentPointDto(
                        entry.getKey().format(weekFormatter),
                        entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    private List<DashboardActivityItemDto> buildRecentActivities(
            List<User> ownerUsers,
            List<Appointment> bookedAppointments,
            List<Product> products) {
        List<ActivityRecord> activities = new ArrayList<>();

        ownerUsers.stream()
                .filter(user -> user.getCreatedAt() != null)
                .forEach(user -> activities.add(new ActivityRecord(
                        "user-" + user.getId(),
                        "Owner registered: " + safeValue(user.getFullName(), user.getEmail(), "Unknown owner"),
                        user.getCreatedAt(),
                        user.getStatus() == UserStatus.APPROVED ? "success" : "info"
                )));

        bookedAppointments.stream()
                .filter(appointment -> appointment.getAppointmentDate() != null)
                .forEach(appointment -> activities.add(new ActivityRecord(
                        "appointment-" + appointment.getId(),
                        "Booked appointment for " + appointment.getAppointmentDate() + " with Dr. "
                                + safeText(appointment.getVeterinarianName(), "Unknown"),
                        appointment.getCreatedAt(),
                        "info"
                )));

        products.stream()
                .filter(product -> product.getCreatedAt() != null)
                .forEach(product -> activities.add(new ActivityRecord(
                        "product-" + product.getId(),
                        "Marketplace listing added: " + safeText(product.getProductName(), "Unnamed product"),
                        product.getCreatedAt(),
                        product.getStatus() == ProductStatus.INACTIVE ? "warning" : "success"
                )));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

        return activities.stream()
                .filter(activity -> activity.occurredAt != null)
                .sorted(Comparator.comparing((ActivityRecord activity) -> activity.occurredAt).reversed())
                .limit(8)
                .map(activity -> new DashboardActivityItemDto(
                        activity.id,
                        activity.text,
                        activity.occurredAt.format(formatter),
                        activity.tone
                ))
                .collect(Collectors.toList());
    }

    private String safeValue(String primary, String secondary, String fallback) {
        String fromPrimary = safeText(primary, null);
        if (fromPrimary != null) {
            return fromPrimary;
        }

        String fromSecondary = safeText(secondary, null);
        return fromSecondary != null ? fromSecondary : fallback;
    }

    private String safeText(String value, String fallback) {
        if (value == null) {
            return fallback;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? fallback : trimmed;
    }

    private static class ActivityRecord {
        private final String id;
        private final String text;
        private final LocalDateTime occurredAt;
        private final String tone;

        private ActivityRecord(String id, String text, LocalDateTime occurredAt, String tone) {
            this.id = id;
            this.text = text;
            this.occurredAt = occurredAt;
            this.tone = tone;
        }
    }


}
