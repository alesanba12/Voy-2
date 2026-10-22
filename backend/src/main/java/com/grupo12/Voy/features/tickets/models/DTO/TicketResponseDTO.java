package com.grupo12.Voy.features.tickets.models.DTO;

import com.grupo12.Voy.features.parties.Dto.PartyResDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

public record TicketResponseDTO (
    UUID idExternal,
    UUID userExternalId,
    String userEmail,
    PartyResDTO party,
    Boolean confirmed,
    ReceiptResponseDTO receipt){
}
