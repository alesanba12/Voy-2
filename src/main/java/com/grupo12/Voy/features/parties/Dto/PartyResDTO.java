package com.grupo12.Voy.features.parties.Dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;

public record PartyResDTO (
        UUID externalId,
        String title,
        String description,
        String city,
        String adress,
        BigDecimal price,
        LocalDateTime dateTime,
        Integer guestLimit,
        Boolean partyAccesibility,
        Boolean state,
        String organizerName,///deberia mostrar username no el email, pero por ahora dejo el email como identificador
        Set<String> coOrganizerName,
        Set<String> tags)
    {}
