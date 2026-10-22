package com.grupo12.Voy.features.parties.Dto;

import com.grupo12.Voy.features.users.Dto.UserDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record PartyUsersDto(
        String title,
        String description,
        String city,
        BigDecimal price,
        String adress,
        LocalDateTime dateTime,
        UserDto organizer) {
}
