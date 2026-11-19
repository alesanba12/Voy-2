package com.grupo12.Voy.features.parties.Dto;

import com.grupo12.Voy.features.users.Dto.UserDto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record PartyUsersDto(
                UUID externalId,
                String title,
                String description,
                String city,
                BigDecimal price,
                String adress,
                LocalDateTime dateTime,
                Boolean tickets,
                UserDto organizer,
                String imageUrl,
                Set<String> tags) {
}
