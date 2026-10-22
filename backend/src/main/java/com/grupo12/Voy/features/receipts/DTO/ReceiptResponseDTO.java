package com.grupo12.Voy.features.receipts.DTO;


import com.grupo12.Voy.features.receipts.Status;
import com.grupo12.Voy.features.users.Dto.UserDto;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record ReceiptResponseDTO (
    UUID externalId,
    BigDecimal price,
    Integer quantity,
    String paymentMethod,
    BigDecimal finalPrice,
    LocalDateTime paymentDate,
    Status status,
    UserDto user){
}
