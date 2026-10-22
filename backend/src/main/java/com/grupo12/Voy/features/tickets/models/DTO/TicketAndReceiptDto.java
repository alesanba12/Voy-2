package com.grupo12.Voy.features.tickets.models.DTO;

import com.grupo12.Voy.features.parties.Dto.PartyResDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;

import java.util.List;
import java.util.UUID;

public record TicketAndReceiptDto(
        UUID userExternalId,
        String userEmail,
        PartyResDTO party,
        ReceiptResponseDTO receipt,
        List<UUID> ticketsExternalIds
) {
}
