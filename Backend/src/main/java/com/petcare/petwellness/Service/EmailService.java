package com.petcare.petwellness.Service;

public interface EmailService {
    void sendEmail(String to, String subject, String body);
}
