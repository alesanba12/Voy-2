package com.grupo12.Voy.features.tickets.models.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.UUID;

public record TicketPrivateRequestDTO(@NotNull(message = "La cantidad no puede estar vacia, debe ser mayor a 0 y menor a 5")
                                      @Positive(message = "La cantidad debe ser mayor a 0")
                                      @Max(value = 1,message = "El maximo permitido es 1 entrada")
                                      Integer quantity,
                                      @NotNull (message = "Ingrese el UUID de la fiesta")
                                      UUID partyIdExternal) {
}
