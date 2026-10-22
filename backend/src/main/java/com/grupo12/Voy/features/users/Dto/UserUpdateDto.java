package com.grupo12.Voy.features.users.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record UserUpdateDto(
        @NotBlank(message = "El usuario no puede estar en blanco")
        String username,

        @Pattern(regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=!.,\\\\/;_\\-<>]).{8,20}$",
        message = "La contraseña debe tener entre 8 y 20 caracteres, incluyendo mayúsculas, minúsculas, números y caracteres especiales.")
        @NotNull(message = "La contraseña no puede ser nula")
        String password) {
}
