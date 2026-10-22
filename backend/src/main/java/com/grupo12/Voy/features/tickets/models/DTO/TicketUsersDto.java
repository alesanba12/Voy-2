package com.grupo12.Voy.features.tickets.models.DTO;

import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;


public record TicketUsersDto (
    String userName,
    String userEmail,
    PartyUsersDto party,
    Boolean confirmed,
    ReceiptResponseDTO receipt){
}
