package com.petcare.petwellness.Domain.Entity;

import com.petcare.petwellness.Enums.UserRole;
import com.petcare.petwellness.Enums.UserStatus;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "users",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email") 
        }
)
public class User {

    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

  
    @Column(nullable = false)
    private String email;

    
    @Column(nullable = true)
    private String password;

   
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private UserStatus status;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

   
    @Column(name = "first_login", nullable = false)
    private boolean firstLogin;

    
    @Column(name = "email_verified", nullable = false)
    private boolean emailVerified;

    
    @Column(name = "profile_completed", nullable = false)
    private boolean profileCompleted;

    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

@Column(name = "full_name", nullable = false)
private String fullName;

@Column(name = "first_name", nullable = false)
private String firstName;

@Column(name = "id_proof_path")
private String idProofPath;

@Column(name = "id_proof_type")
private String idProofType;

@Column(name = "profile_image_path")
private String profileImagePath;


  
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    

   public User() {
    }

    public User(String email, UserRole role) {
        this.email = email;
        this.role = role;
    }


    public Long getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    
    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public UserStatus getStatus() {
        return status;
    }

    public void setStatus(UserStatus status) {
        this.status = status;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isFirstLogin() {
        return firstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public boolean isProfileCompleted() {
        return profileCompleted;
    }

    public void setProfileCompleted(boolean profileCompleted) {
        this.profileCompleted = profileCompleted;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getIdProofPath() {
        return idProofPath;
    }

    public void setIdProofPath(String idProofPath) {
        this.idProofPath = idProofPath;
    }

    public String getIdProofType() {
        return idProofType;
    }

    public void setIdProofType(String idProofType) {
        this.idProofType = idProofType;
    }

    public String getProfileImagePath() {
        return profileImagePath;
    }

    public void setProfileImagePath(String profileImagePath) {
        this.profileImagePath = profileImagePath;
    }
}
