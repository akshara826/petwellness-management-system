package com.petcare.petwellness.Util;

import java.util.Random;


public class OtpGeneratorUtil {

    private static final Random random = new Random();

    public static String generateOtp() {
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
}
