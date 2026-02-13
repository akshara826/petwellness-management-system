package com.petcare.petwellness.Exceptions;

import com.petcare.petwellness.DTO.Response.ErrorResponseDto;
import com.petcare.petwellness.Exceptions.CustomException.BadRequestException;
import com.petcare.petwellness.Exceptions.CustomException.ResourceNotFoundException;
import com.petcare.petwellness.Exceptions.CustomException.UnauthorizedException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponseDto> handleNotFound(ResourceNotFoundException ex) {

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 404),
                HttpStatus.NOT_FOUND
        );
    }

    
    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponseDto> handleBadRequest(BadRequestException ex) {

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 400),
                HttpStatus.BAD_REQUEST
        );
    }

    
    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponseDto> handleUnauthorized(UnauthorizedException ex) {

        return new ResponseEntity<>(
                new ErrorResponseDto(ex.getMessage(), 401),
                HttpStatus.UNAUTHORIZED
        );
    }

    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponseDto> handleGeneral(Exception ex) {

        return new ResponseEntity<>(
                new ErrorResponseDto("Internal Server Error", 500),
                HttpStatus.INTERNAL_SERVER_ERROR
        );
    }
}
