package com.grupo12.Voy.features.organizers.dto;

import jakarta.validation.constraints.NotBlank;

public record OrganizerRejectReqDTO(
        @NotBlank(message = "El motivo de rechazo es obligatorio")
        String reason
) {
}