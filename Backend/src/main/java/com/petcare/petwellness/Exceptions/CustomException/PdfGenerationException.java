package com.petcare.petwellness.Exceptions.CustomException;

public class PdfGenerationException extends RuntimeException {

    private final String stage;

    public PdfGenerationException(String stage, String message, Throwable cause) {
        super(message, cause);
        this.stage = stage;
    }

    public String getStage() {
        return stage;
    }
}
