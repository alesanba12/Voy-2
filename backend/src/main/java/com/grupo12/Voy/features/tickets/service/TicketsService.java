package com.grupo12.Voy.features.tickets.service;

import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.ExceededAmountException;
import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.features.parties.mapper.PartyMapper;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.parties.service.IPartyService;
import com.grupo12.Voy.features.receipts.DTO.ReceiptRequestDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.ReceiptMapper;
import com.grupo12.Voy.features.receipts.ReceiptRepository;
import com.grupo12.Voy.features.receipts.Status;
import com.grupo12.Voy.features.receipts.service.IReceiptService;
import com.grupo12.Voy.features.tickets.TicketMapper;
import com.grupo12.Voy.features.tickets.TicketRepository;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.tickets.models.DTO.TicketAndReceiptDto;
import com.grupo12.Voy.features.tickets.models.DTO.TicketPrivateRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import com.grupo12.Voy.features.tickets.specification.TicketSpecification;
import com.grupo12.Voy.features.users.Mapper.UserMapper;
import com.grupo12.Voy.features.users.UserRepository;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class TicketsService  implements ITicketsService{
    private final TicketRepository ticketRepository;
    private TicketMapper ticketMapper;
    private final UserMapper userMapper;
    private final UserRepository userRepository;
    private final PartyRepository partyRepository;
    private final ReceiptRepository receiptRepository;
    private final ReceiptMapper receiptMapper;
    private final PartyMapper partyMapper;
    private final IPartyService partyService;
    private final IReceiptService receiptService;

    @Override
    public List<TicketResponseDTO> getAllAdmin(UUID ticketId, Boolean isConfimed,
                                          String title, String usernameOrganizer, String usernameUser){
        PredicateSpecification<TicketEntity> spec = PredicateSpecification.allOf(
                TicketSpecification.externalIdEqual(ticketId),
                TicketSpecification.isConfirmed(isConfimed),
                TicketSpecification.partyTitleContains(title),
                TicketSpecification.partyOrganizerNameContains(usernameOrganizer),
                TicketSpecification.userUsernameContains(usernameUser)
        );

        return ticketRepository.findAll(spec)
                .stream().map(ticketMapper::toResponseDto).toList();
    }
    @Override
    public List<TicketResponseDTO> getAllOrganizer(UUID ticketId, Boolean isConfimed,
                                          String title, UUID userExtId, String usernameUser){
        UserEntity user = userRepository.findByExternalId(userExtId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        PredicateSpecification<TicketEntity> spec = PredicateSpecification.allOf(
                TicketSpecification.externalIdEqual(ticketId),
                TicketSpecification.isConfirmed(isConfimed),
                TicketSpecification.partyTitleContains(title),
                TicketSpecification.partyOrganizerNameContains(user.getUsername()),
                TicketSpecification.userUsernameContains(usernameUser)
        );
        return ticketRepository.findAll(spec)
                .stream().map(ticketMapper::toResponseDto).toList();
    }

    @Override
    public List<TicketResponseDTO> getAllUser(UUID ticketId, Boolean isConfimed,
                                               String title, String usernameOrganizer, UUID userExtId){
        UserEntity user = userRepository.findByExternalId(userExtId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        PredicateSpecification<TicketEntity> spec = PredicateSpecification.allOf(
                TicketSpecification.externalIdEqual(ticketId),
                TicketSpecification.isConfirmed(isConfimed),
                TicketSpecification.partyTitleContains(title),
                TicketSpecification.partyOrganizerNameContains(usernameOrganizer),
                TicketSpecification.userUsernameContains(user.getUsername())
        );

        return ticketRepository.findAll(spec)
                .stream().map(ticketMapper::toResponseDto).toList();
    }

    public List<TicketResponseDTO> getByParty(UUID partyId){
        PartyEntity party = partyRepository.findByExternalIdAndLogicStateTrue(partyId)
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el usuario"));
        return ticketRepository.findByParty(party).stream()
                .map(ticketMapper::toResponseDto).toList();
    }

    @Transactional
    public TicketAndReceiptDto createTicket(UUID userId,TicketRequestDTO request,ReceiptEntity receipt){
        UserEntity user = userRepository.findByExternalId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        PartyEntity party = partyRepository
                .findByExternalIdAndLogicStateTrue(request.partyIdExternal())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra la fiesta solicitada"));
        int available = party.getGuestLimit() - ticketRepository.findByParty(party).size();
        TicketAndReceiptDto dtoTickets = new TicketAndReceiptDto(user.getExternalId(),user.getEmail(),partyMapper.toResDTO(party),receiptMapper.toResponseDTO(receipt),new ArrayList<>());
        if (request.quantity() > available){
            throw new ExceededAmountException("Solo quedan "+ available + " disponibles");
        }
        else{
            for(int i = 0; i < request.quantity(); i++){
                TicketEntity ticket = ticketMapper.toEntity(request);
                ticket.setReceiptEntity(receipt);
                ticket.setUser(user);
                ticket.setParty(party);
                ticketRepository.save(ticket);
                dtoTickets.ticketsExternalIds().add(ticket.getIdExternal());
            }
        }
        if(receipt.getStatus().equals(Status.APROBADA)){
            confirmPurchase(receipt.getExternalId());
        }
        return dtoTickets;
    }

    @Transactional
    public TicketResponseDTO transferTicket(UUID externalId, UUID oldUserId, UUID newUserExtId){
        TicketEntity ticket = ticketRepository.findByIdExternal(externalId)
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el ticket"));
        UserEntity user = userRepository.findByExternalId(newUserExtId)
                .orElseThrow(() -> new EntityNotFoundException("El usuario destino no se encuentra"));
        if(!ticket.getUser().getExternalId().equals(oldUserId)){
            throw new NotAllowedException("Solo el propietario del ticket puede transferirlo");
        }
        if(!ticket.getConfirmed()){
            throw new NotAllowedException("La compra del ticket esta pendiente de aprobacion, todavia no puede ser transferido");
        }
        ticket.setUser(user);
        TicketEntity ticket1 = ticketRepository.save(ticket);
        return ticketMapper.toResponseDto(ticket1);
    }

    @Transactional
    public TicketAndReceiptDto confirmPurchase(UUID receiptExtId){
        ReceiptEntity receipt = receiptRepository.findByExternalId(receiptExtId)
                .orElseThrow(() -> new EntityNotFoundException("Recibo no encontrado"));
        List<TicketEntity> ticketList = ticketRepository.findByReceiptEntity(receipt);
        if(ticketList.isEmpty()){
            throw new EntityNotFoundException("No se encuentran tickets asociados al recibo");
        }
        receipt.setStatus(Status.APROBADA);
        receiptRepository.save(receipt);
        TicketAndReceiptDto dtoTickets = new TicketAndReceiptDto(receipt.getUser().getExternalId(),
                receipt.getUser().getEmail(),
                partyMapper.toResDTO(ticketList.getFirst().getParty()),
                receiptMapper.toResponseDTO(receipt),
                ticketList.stream().map(x -> x.getIdExternal()).toList());
        for (int i = 0; i < ticketList.size(); i++){
            TicketEntity ticket = ticketList.get(i);
            ticket.setConfirmed(true);
            ticketRepository.save(ticket);
        }
        return dtoTickets;
    }

    @Transactional
    public void rejectPurchase(UUID receiptExtId){
        ReceiptEntity receipt = receiptRepository.findByExternalId(receiptExtId)
                .orElseThrow(() -> new EntityNotFoundException("Recibo no encontrado"));
        List<TicketEntity> ticketList = ticketRepository.findByReceiptEntity(receipt);
        if(!receipt.getStatus().equals(Status.PENDIENTE)){
            throw new NotAllowedException("La compra ya ha sido aprobada o rechazada anteriormente, no se puede rechazar");
        }
        receipt.setStatus(Status.RECHAZADA);
        receiptRepository.save(receipt);
        for (int i = 0; i < ticketList.size(); i++){
            TicketEntity ticket = ticketList.get(i);
            ticketRepository.delete(ticket);
        }
    }

    @Transactional
    public void returnTicket(UUID userId, UUID ticketExtId){
        TicketEntity ticket = ticketRepository.findByIdExternal(ticketExtId)
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el Ticket"));
        if (!ticket.getUser().getExternalId().equals(userId)){
            throw new NotAllowedException("Para devolver un ticket debe ser el propietario del mismo");
        }
        if(ticket.getReceiptEntity().getFinalPrice().intValue() > 0.0){
            throw new NotAllowedException("Solo se pueden devolver los tickets gratuitos, cualquier cosa comunicarse con el creador del evento");
        }
        ticketRepository.delete(ticket);
    }

    @Transactional
    public TicketAndReceiptDto purchaseTickets(UUID userId, TicketRequestDTO ticketDTO){
        int available = partyService.getByExternalId(ticketDTO.partyIdExternal()).guestLimit() - getByParty(ticketDTO.partyIdExternal()).size();
        if (ticketDTO.quantity() > available){
            throw new ExceededAmountException("Solo quedan "+ available + "entradas disponibles");
        }
        PartyEntity party = partyRepository.findByExternalIdAndLogicStateTrue(ticketDTO.partyIdExternal())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el evento buscado"));
        BigDecimal price = party.getPrice();
        UserEntity user = userRepository.findByExternalId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        ReceiptRequestDTO receiptDTO = new ReceiptRequestDTO(
                price,
                ticketDTO.paymentMethod(),
                ticketDTO.quantity(),
                userMapper.userToDto(user));
        ReceiptResponseDTO receipt = receiptService.createReceipt(receiptDTO);
        ReceiptEntity receiptEntity = receiptRepository.findByExternalId(receipt.externalId())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el recibo"));
        return createTicket(userId,ticketDTO,receiptEntity);
    }

    @Transactional
    public TicketAndReceiptDto getTicketsPrivate(UUID userId, TicketPrivateRequestDTO ticketDTO){
        int available = partyService.getByExternalId(ticketDTO.partyIdExternal()).guestLimit() - getByParty(ticketDTO.partyIdExternal()).size();
        if (ticketDTO.quantity() > available){
            throw new ExceededAmountException("Solo quedan "+ available + "entradas disponibles");
        }
        PartyEntity party = partyRepository.findByExternalIdAndLogicStateTrue(ticketDTO.partyIdExternal())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el evento buscado"));
        UserEntity user = userRepository.findByExternalId(userId)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado"));
        ReceiptRequestDTO receiptDTO = new ReceiptRequestDTO(
                BigDecimal.ZERO,
                "Gratis",
                ticketDTO.quantity(),
                userMapper.userToDto(user));
        ReceiptResponseDTO receipt = receiptService.createReceipt(receiptDTO);
        ReceiptEntity receiptEntity = receiptRepository.findByExternalId(receipt.externalId())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el recibo"));
        return createTicket(userId,ticketMapper.toRequestDto(ticketDTO),receiptEntity);
    }
}
