package com.petcare.petwellness.Domain.Entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;


@Entity
@Table(
        name = "email_otp",
        uniqueConstraints = {
                @UniqueConstraint(columnNames = "email")
        }
)
public class EmailOtp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    
    @Column(nullable = false)
    private String email;

    
    @Column(nullable = false, length = 6)
    private String otp;

    
    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    
    @Column(nullable = false)
    private boolean verified;


    public EmailOtp() {
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

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime expiryTime) {
        this.expiryTime = expiryTime;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }
}
