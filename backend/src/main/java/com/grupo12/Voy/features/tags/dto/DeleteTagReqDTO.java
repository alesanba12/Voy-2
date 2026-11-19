package com.grupo12.Voy.features.tags.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

@Schema(description = "Solicitud para eliminar una etiqueta con opción de reemplazo")
public record DeleteTagReqDTO(
        @NotBlank(message = "El nombre de la etiqueta a eliminar es obligatorio")
        @Length(max = 30, message = "El nombre no puede tener más de 30 caracteres")
        @Schema(description = "Nombre de la etiqueta que se va a eliminar", example = "Reggaeton")
        String tagName,

        @Length(max = 30, message = "El nombre del reemplazo no puede tener más de 30 caracteres")
        @Schema(description = "Nombre de la etiqueta de reemplazo si algún evento queda sin etiquetas", example = "General")
        String replacementTagName
) {
}
