package com.grupo12.Voy.features.users.Dto;

import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;

public record UserUpdateDto(
        @NotBlank(message = "El usuario no puede estar en blanco")
        String username,
        @Max(value = 150, message = "La biografia no puede tener mas de 150 caracteres")
        String bio,

        @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.,\\\\/;_\\-<>]).{8,20}$",
        message = "La contraseña debe tener entre 8 y 20 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.")
        @NotNull(message = "La contraseña no puede ser nula")
        String password,
        MultipartFile image) {
}
