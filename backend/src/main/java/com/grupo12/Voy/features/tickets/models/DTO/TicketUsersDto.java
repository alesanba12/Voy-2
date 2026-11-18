package com.grupo12.Voy.features.tickets.models.DTO;

import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;

import java.util.UUID;


public record TicketUsersDto (
        UUID ticketExternalId,
    String userName,
    String userEmail,
    PartyUsersDto party,
    boolean confirmed,
    ReceiptResponseDTO receipt){
}