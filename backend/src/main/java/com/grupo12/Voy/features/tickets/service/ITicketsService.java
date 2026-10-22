package com.grupo12.Voy.features.tickets.service;

import com.grupo12.Voy.features.receipts.DTO.ReceiptRequestDTO;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.tickets.models.DTO.TicketAndReceiptDto;
import com.grupo12.Voy.features.tickets.models.DTO.TicketPrivateRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ITicketsService {
    List<TicketResponseDTO> getAllAdmin(UUID ticketId, Boolean isConfimed,
                                   String title, String usernameOrganizer, String usernameUser);
    List<TicketResponseDTO> getAllOrganizer(UUID ticketId, Boolean isConfimed,
                                        String title, UUID userExtId, String usernameUser);
    List<TicketResponseDTO> getAllUser(UUID ticketId, Boolean isConfimed,
                                   String title, String usernameOrganizer, UUID userExtId);
    List<TicketResponseDTO> getByParty(UUID partyId);
    TicketAndReceiptDto createTicket(UUID userId,TicketRequestDTO request, ReceiptEntity receipt);
    TicketResponseDTO transferTicket(UUID externalId, UUID oldUserId, UUID newUserExtID);
    TicketAndReceiptDto confirmPurchase(UUID receiptExtId);
    void rejectPurchase(UUID receiptExtId);
    void returnTicket(UUID ticketExtId, UUID userExtId);
    TicketAndReceiptDto purchaseTickets(UUID userId, TicketRequestDTO ticketDTO);
    TicketAndReceiptDto getTicketsPrivate(UUID userId, TicketPrivateRequestDTO ticketDTO);
}
