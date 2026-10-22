package com.grupo12.Voy.features.parties.Dto;

import com.grupo12.Voy.features.tags.dto.TagsDTO;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PartyReqDTO(
        @NotBlank(message = "El titulo es obligatorio")
        String title,
        @NotNull(message = "La descripcion no puede ser nula")
        String description,
        @NotBlank(message = "La ciudad es obligatoria")
        String city,
        @NotBlank(message = "La direccion es obligatoria")
        String adress,
        @NotNull(message = "El valor no puede ser nulo")
        @PositiveOrZero(message = "El precio debe ser positivo")
        BigDecimal price,
        @Future(message = "La fecha es obligatoria")
        LocalDateTime dateTime,
        @NotNull(message = "El limite de invitados no puede ser nulo")
        @PositiveOrZero(message = "El limite de invitados tiene que ser mayor a 0")
        Integer guestLimit,
        @NotNull(message = "La visibilidad del evento no puede ser nulo")
        Boolean partyAccesibility) {
}
