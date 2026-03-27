package com.petcare.petwellness.Service.ServiceImp;

import com.petcare.petwellness.Service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImp implements EmailService {

    private final JavaMailSender mailSender;
    private final String senderEmail;

    public EmailServiceImp(JavaMailSender mailSender,
                           @Value("${spring.mail.username}") String senderEmail) {
        this.mailSender = mailSender;
        this.senderEmail = senderEmail;
    }

    @Override
    public void sendEmail(String to, String subject, String body) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(senderEmail);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);

        try {
            mailSender.send(message);
        } catch (MailException ex) {
            throw new RuntimeException(
                    "Failed to send email via SMTP. Check MAIL_USERNAME, MAIL_PASSWORD, Gmail App Password, and whether the backend loaded secrets.properties. Root cause: "
                            + ex.getMessage(),
                    ex
            );
        }
    }
}
