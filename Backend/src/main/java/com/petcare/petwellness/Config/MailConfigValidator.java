package com.petcare.petwellness.Config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class MailConfigValidator {

    private static final Logger log = LoggerFactory.getLogger(MailConfigValidator.class);

    private final String mailUsername;
    private final String mailPassword;

    public MailConfigValidator(
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword) {
        this.mailUsername = mailUsername == null ? "" : mailUsername.trim();
        this.mailPassword = mailPassword == null ? "" : mailPassword.trim();
    }

    @PostConstruct
    public void validate() {
        boolean usingDefaultUsername = "dev@example.com".equalsIgnoreCase(mailUsername);
        boolean usingDefaultPassword = "dev-password".equals(mailPassword);

        if (mailUsername.isEmpty() || mailPassword.isEmpty() || usingDefaultUsername || usingDefaultPassword) {
            throw new IllegalStateException(
                    "Mail configuration is not loaded correctly. " +
                    "Check MAIL_USERNAME and MAIL_PASSWORD in secrets.properties or environment variables."
            );
        }

        log.info("SMTP mail configuration loaded for {}", maskEmail(mailUsername));
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf('@');
        if (atIndex <= 1) {
            return "***";
        }
        return email.charAt(0) + "***" + email.substring(atIndex);
    }
}
