package com.grupo12.Voy.common.exceptions.handler;

import com.grupo12.Voy.common.exceptions.*;
import com.grupo12.Voy.common.exceptions.models.ErrorDetails;
import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@RestControllerAdvice
public class ExceptionHandlerGlobal {

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ErrorDetails> handlerJwtException(JwtException ex, WebRequest request){
        ErrorDetails errorDetails = ErrorDetails.builder()
                .message("Token inválido o expirado: " + ex.getMessage())
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorDetails> handlerBadCredentialsException(BadCredentialsException ex, WebRequest request){
        ErrorDetails errorDetails = ErrorDetails.builder()
                .message("Credenciales inválidas")
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ErrorDetails> handlerUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request){
        ErrorDetails errorDetails = ErrorDetails.builder()
                .message("Credenciales inválidas")
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorDetails);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorDetails> handlerAccessDeniedException(AccessDeniedException ex, WebRequest request){
        ErrorDetails errorDetails = ErrorDetails.builder()
                .message("Acceso denegado: permisos insuficientes")
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDetails);
    }
    @ExceptionHandler(AlreadyExistsException.class)
    public ResponseEntity<ErrorDetails> handlerAlreadyExistsException(AlreadyExistsException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    @ExceptionHandler(EntityDuplicatedException.class)
    public ResponseEntity<ErrorDetails> handlerEntityDuplicatedException(EntityDuplicatedException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ErrorDetails> handlerEntityNotFoundException(EntityNotFoundException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetails);
    }

    @ExceptionHandler(ExceededAmountException.class)
    public ResponseEntity<ErrorDetails> handlerExceededAmountException(ExceededAmountException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(errorDetails);
    }

    @ExceptionHandler(InvalidFieldException.class)
    public ResponseEntity<ErrorDetails> handlerInvalidFieldException(InvalidFieldException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorDetails);
    }

    @ExceptionHandler(NotAllowedException.class)
    public ResponseEntity<ErrorDetails> handlerNotAllowedException(NotAllowedException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(errorDetails);
    }

    @ExceptionHandler(EntityInactiveException.class)
    public ResponseEntity<ErrorDetails> handlerEntityInactiveException(EntityInactiveException ex, WebRequest request){
        ErrorDetails errorDetails = errorBuilder(ex,request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(errorDetails);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorDetails> handlerValidations(MethodArgumentNotValidException ex,WebRequest request) {
        String errorList = ex
                .getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fieldError -> fieldError.getField() + ": " + fieldError.getDefaultMessage() + '\n')
                .collect(Collectors.joining());
        ErrorDetails response = new ErrorDetails(errorList,
                request.getDescription(false),
                LocalDateTime.now());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorDetails> handleMaxUploadSizeExceededException(MaxUploadSizeExceededException ex, WebRequest request) {
        ErrorDetails errorDetails = ErrorDetails.builder()
                .message("El archivo subido supera el límite máximo permitido (máximo 5MB por imagen)")
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(errorDetails);
    }

    public ErrorDetails errorBuilder(RuntimeException ex, WebRequest request){
        return ErrorDetails
                .builder()
                .message(ex.getMessage())
                .endpoint(request.getDescription(false))
                .dateTime(LocalDateTime.now())
                .build();
    }
}
