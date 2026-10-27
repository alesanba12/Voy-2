package com.grupo12.Voy.features.organizers.dto;

import jakarta.validation.constraints.NotNull;
import org.springframework.web.multipart.MultipartFile;

public record OrganizerVerifyReqDTO(
        @NotNull(message = "La foto del frente del DNI es obligatoria")
        MultipartFile dniFront,

        @NotNull(message = "La foto del dorso del DNI es obligatoria")
        MultipartFile dniBack,

        String additionalInfo
) {
}