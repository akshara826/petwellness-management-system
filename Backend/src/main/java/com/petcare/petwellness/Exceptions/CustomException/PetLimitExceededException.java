package com.petcare.petwellness.Exceptions.CustomException;

public class PetLimitExceededException extends RuntimeException {

    public PetLimitExceededException(String message) {
        super(message);
    }
}
