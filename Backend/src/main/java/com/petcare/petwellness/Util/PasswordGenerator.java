package com.petcare.petwellness.Util;

import java.security.SecureRandom;

/*
 * Generates simple temporary password
 * Used only until user sets real password
 */
public class PasswordGenerator {

    private static final String ALPHANUMERIC =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    private static final SecureRandom random = new SecureRandom();

    public static String generate(int length) {

        if (length < 6) {
            throw new IllegalArgumentException("Password length must be at least 6");
        }

        StringBuilder password = new StringBuilder();

        for (int i = 0; i < length; i++) {
            int index = random.nextInt(ALPHANUMERIC.length());
            password.append(ALPHANUMERIC.charAt(index));
        }

        return password.toString();
    }
}
