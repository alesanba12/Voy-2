package com.grupo12.Voy.features.tickets.models.DTO;

import com.grupo12.Voy.features.users.Dto.UserDto;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

public record TicketRequestDTO (
        @NotBlank(message = "Ingrese el metodo de pago")
        String paymentMethod,
        @NotNull(message = "La cantidad no puede estar vacia, debe ser mayor a 0 y menor a 5")
        @Positive(message = "La cantidad debe ser mayor a 0")
        @Max(value = 5,message = "El maximo permitido es 5 entradas")
        Integer quantity,
        @NotNull (message = "Ingrese el UUID de la fiesta")
        UUID partyIdExternal){
}
