package com.petcare.petwellness.Exceptions.CustomException;

public class UnauthorizedException extends RuntimeException {

    public UnauthorizedException(String message) {
        super(message);
    }
}
