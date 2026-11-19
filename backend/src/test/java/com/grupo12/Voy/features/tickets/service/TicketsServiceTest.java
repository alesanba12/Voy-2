package com.grupo12.Voy.features.tickets.service;

import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.receipts.Status;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.tickets.TicketMapper;
import com.grupo12.Voy.features.tickets.TicketRepository;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class TicketsServiceTest {

    @Mock
    private TicketRepository ticketRepository;

    @Mock
    private TicketMapper ticketMapper;

    @InjectMocks
    private TicketsService ticketsService;

    @Test
    void checkInOrganizerTicket_shouldMarkOwnedConfirmedPaidTicketAsCheckedIn() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(ticketId, organizerId, BigDecimal.valueOf(500), true, Status.APROBADA);
        TicketResponseDTO response = new TicketResponseDTO(
                ticketId, UUID.randomUUID(), "guest@example.com", null, true, true, null);

        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));
        given(ticketRepository.save(ticket)).willReturn(ticket);
        given(ticketMapper.toResponseDto(ticket)).willReturn(response);

        TicketResponseDTO result = ticketsService.checkInOrganizerTicket(ticketId, organizerId);

        assertThat(ticket.getCheckedIn()).isTrue();
        assertThat(result).isSameAs(response);
        then(ticketRepository).should().save(ticket);
    }

    @Test
    void checkInOrganizerTicket_shouldRejectTicketOwnedByAnotherOrganizer() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(
                ticketId, UUID.randomUUID(), BigDecimal.valueOf(500), true, Status.APROBADA);
        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));

        assertThrows(
                NotAllowedException.class,
                () -> ticketsService.checkInOrganizerTicket(ticketId, organizerId));

        then(ticketRepository).should(never()).save(ticket);
    }

    @Test
    void checkInOrganizerTicket_shouldRejectFreeEvents() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(ticketId, organizerId, BigDecimal.ZERO, true, Status.APROBADA);
        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));

        assertThrows(
                NotAllowedException.class,
                () -> ticketsService.checkInOrganizerTicket(ticketId, organizerId));

        then(ticketRepository).should(never()).save(ticket);
    }

    @Test
    void checkInOrganizerTicket_shouldRejectUnconfirmedTickets() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(
                ticketId, organizerId, BigDecimal.valueOf(500), false, Status.PENDIENTE);
        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));

        assertThrows(
                NotAllowedException.class,
                () -> ticketsService.checkInOrganizerTicket(ticketId, organizerId));

        then(ticketRepository).should(never()).save(ticket);
    }

    @Test
    void checkInOrganizerTicket_shouldRejectPendingReceiptEvenIfTicketIsConfirmed() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(
                ticketId, organizerId, BigDecimal.valueOf(500), true, Status.PENDIENTE);
        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));

        assertThrows(
                NotAllowedException.class,
                () -> ticketsService.checkInOrganizerTicket(ticketId, organizerId));

        then(ticketRepository).should(never()).save(ticket);
    }

    @Test
    void checkInOrganizerTicket_shouldRejectTicketsAlreadyCheckedIn() {
        UUID ticketId = UUID.randomUUID();
        UUID organizerId = UUID.randomUUID();
        TicketEntity ticket = ticket(
                ticketId, organizerId, BigDecimal.valueOf(500), true, Status.APROBADA);
        ticket.setCheckedIn(true);
        given(ticketRepository.findByIdExternal(ticketId)).willReturn(Optional.of(ticket));

        assertThrows(
                NotAllowedException.class,
                () -> ticketsService.checkInOrganizerTicket(ticketId, organizerId));

        then(ticketRepository).should(never()).save(ticket);
    }

    private TicketEntity ticket(
            UUID ticketId,
            UUID organizerId,
            BigDecimal partyPrice,
            boolean confirmed,
            Status receiptStatus) {
        UserEntity organizer = new UserEntity();
        organizer.setExternalId(organizerId);

        PartyEntity party = new PartyEntity();
        party.setOrganizer(organizer);
        party.setPrice(partyPrice);

        ReceiptEntity receipt = new ReceiptEntity();
        receipt.setStatus(receiptStatus);

        TicketEntity ticket = new TicketEntity();
        ticket.setIdExternal(ticketId);
        ticket.setParty(party);
        ticket.setReceiptEntity(receipt);
        ticket.setConfirmed(confirmed);
        ticket.setCheckedIn(false);
        return ticket;
    }
}
