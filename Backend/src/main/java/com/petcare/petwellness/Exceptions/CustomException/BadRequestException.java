package com.petcare.petwellness.Exceptions.CustomException;

public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
