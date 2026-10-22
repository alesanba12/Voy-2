package com.grupo12.Voy.features.tickets.scheduler;

import com.grupo12.Voy.features.tickets.TicketRepository;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
public class TicketScheduler {
    private final TicketRepository ticketRepository;

    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void unconfirmTicketsFromPastParties() {
        List<TicketEntity> expiredTickets = ticketRepository
                .findConfirmedTicketsFromPastParties(LocalDateTime.now());

        expiredTickets.forEach(ticket -> ticket.setConfirmed(false));
        ticketRepository.saveAll(expiredTickets);
    }
}
