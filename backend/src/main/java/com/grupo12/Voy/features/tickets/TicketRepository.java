package com.grupo12.Voy.features.tickets;

import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TicketRepository extends JpaRepository<TicketEntity,Long>, JpaSpecificationExecutor<TicketEntity> {
    Optional<TicketEntity> findByIdExternal(UUID id);
    List<TicketEntity> findByReceiptEntity(ReceiptEntity receipt);
    List<TicketEntity> findByParty(PartyEntity party);
    @Query("""
        SELECT t FROM TicketEntity t
        WHERE t.party.dateTime < :now
        AND t.confirmed = true
    """)
    List<TicketEntity> findConfirmedTicketsFromPastParties(
            @Param("now") LocalDateTime now
    );
}
