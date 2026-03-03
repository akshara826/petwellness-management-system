package com.petcare.petwellness.Exceptions;

import com.petcare.petwellness.DTO.Response.ErrorResponseDto;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.PetLimitExceededException;
import com.petcare.petwellness.Exceptions.CustomException.PdfGenerationException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.multipart.MultipartException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 404),
                HttpStatus.NOT_FOUND
        );
    }

    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(BadRequestException ex) {
        log.warn("Bad request: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorized(UnauthorizedException ex) {
        log.warn("Unauthorized: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 401),
                HttpStatus.UNAUTHORIZED
        );
    }

    @ExceptionHandler(PetLimitExceededException.class)
    public ResponseEntity<ErrorResponseDto> handlePetLimitExceeded(PetLimitExceededException ex) {
        log.warn("Pet limit exceeded: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponseDto> handleValidation(MethodArgumentNotValidException ex) {
        log.warn("Validation failed: {}", ex.getMessage());
        String message = ex.getBindingResult().getFieldError() != null
                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                : "Validation failed";

        return new ResponseEntity<>(
                new ErrorResponseDto(message, 400),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(BindException.class)
    public ResponseEntity<ErrorResponseDto> handleBindException(BindException ex) {
        log.warn("Binding failed: {}", ex.getMessage());
        String message = ex.getBindingResult().getFieldError() != null
                ? ex.getBindingResult().getFieldError().getDefaultMessage()
                : "Binding failed";

        return new ResponseEntity<>(
                new ErrorResponseDto(message, 400),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingHeader(MissingRequestHeaderException ex) {
        log.warn("Missing header: {}", ex.getHeaderName());

        return new ResponseEntity<>(
                new ErrorResponseDto("Required header is missing: " + ex.getHeaderName(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    @SuppressWarnings("deprecation")
@ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponseDto> handleMaxUploadSize(MaxUploadSizeExceededException ex) {
        log.warn("Upload size exceeded: {}", ex.getMessage());

        return new ResponseEntity<>(
                new ErrorResponseDto(
                        "Upload too large. Please keep file size within configured limit.",
                        413
                ),
                HttpStatus.PAYLOAD_TOO_LARGE
        );
    }

    @ExceptionHandler(MultipartException.class)
    public ResponseEntity<ErrorResponseDto> handleMultipartException(MultipartException ex) {
        log.warn("Multipart parsing failed", ex);
        String rootCause = ex.getMostSpecificCause() != null
                ? ex.getMostSpecificCause().getMessage()
                : ex.getMessage();

        return new ResponseEntity<>(
                new ErrorResponseDto(
                        "Multipart parsing failed: " + rootCause,
                        400
                ),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(MissingServletRequestPartException.class)
    public ResponseEntity<ErrorResponseDto> handleMissingPart(MissingServletRequestPartException ex) {
        log.warn("Missing multipart part: {}", ex.getRequestPartName());

        return new ResponseEntity<>(
                new ErrorResponseDto("Required multipart field is missing: " + ex.getRequestPartName(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    @ExceptionHandler(PdfGenerationException.class)
    public ResponseEntity<ErrorResponseDto> handlePdfGeneration(PdfGenerationException ex) {
        String rootCause = ex.getCause() != null && ex.getCause().getMessage() != null
                ? ex.getCause().getMessage()
                : ex.getMessage();
        log.error("PDF generation failed at stage {}: {}", ex.getStage(), rootCause, ex);

        return new ResponseEntity<>(
                new ErrorResponseDto(
                        "PDF generation failed at stage " + ex.getStage() + ": " + rootCause,
                        500
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }

    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);

        return new ResponseEntity<>(
                new ErrorResponseDto(
                        ex.getClass().getSimpleName() + ": " + (ex.getMessage() == null ? "no message" : ex.getMessage()),
                        500
                ),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
