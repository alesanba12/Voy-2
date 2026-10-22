package com.grupo12.Voy.features.receipts.DTO;

import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

public record ReceiptRequestDTO (
    @NotNull(message = "Ingrese el precio, puede ser 0 o mayor")
    @PositiveOrZero(message = "El monto debe ser 0 o positivo")
    BigDecimal price,
    @NotBlank (message = "Ingrese el metodo de pago")
    String paymentMethod,
    @NotNull(message = "El campo cantidad no puede estar vacio")
    @Positive(message = "La cantidad debe ser mayor a 0")
    @Max(value = 5,message = "El maximo permitido es 5 entradas")
    Integer quantity,
    @NotNull(message = "Ingrese el UUID del usuario")
    UserDto user){
}
