package com.grupo12.Voy.features.tickets;

import com.grupo12.Voy.features.parties.mapper.PartyMapper;
import com.grupo12.Voy.features.receipts.ReceiptMapper;
import com.grupo12.Voy.features.tickets.models.DTO.TicketPrivateRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketUsersDto;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {PartyMapper.class,ReceiptMapper.class})
public interface TicketMapper {
    @Mapping(target = "userExternalId", source = "user.externalId")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "receipt", source = "receiptEntity")
    @Mapping(target = "party", source = "party")
    TicketResponseDTO toResponseDto(TicketEntity ticket);

    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "userEmail", source = "user.email")
    @Mapping(target = "receipt", source = "receiptEntity")
    @Mapping(target = "party", source = "party")
    TicketUsersDto toUsersDto(TicketEntity ticket);

    @Mapping(target = "party.externalId", source = "partyIdExternal")
    TicketEntity toEntity(TicketRequestDTO ticket);

    @Mapping(target = "paymentMethod",constant = "Gratis")
    TicketRequestDTO toRequestDto(TicketPrivateRequestDTO ticket);

}
