package com.grupo12.Voy.features.parties.Dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PartyReqPrivateDto(
        @NotBlank(message = "El titulo es obligatorio")
        String title,
        @NotNull(message = "La descripcion no puede ser nula")
        String description,
        @NotBlank(message = "La ciudad es obligatoria")
        String city,
        @NotBlank(message = "La direccion es obligatoria")
        String adress,
        @Future(message = "La fecha es obligatoria")
        LocalDateTime dateTime,
        @NotNull(message = "El limite de invitados no puede ser nulo")
        @PositiveOrZero(message = "El limite de invitados tiene que ser mayor a 0")
        @Max(value = 30,message = "La cantidad maxima de invitados para un evento privado no debe superar los 30")
        Integer guestLimit
        ) {
}