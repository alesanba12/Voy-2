package com.grupo12.Voy.common.security.dto;

import jakarta.validation.constraints.NotBlank;

public record AuthRequest(
        @NotBlank(message = "El nombre de usuario es obligatorio")
        String username,
        @NotBlank(message = "La contraseña es obligatoria")
        String password
) {
}
