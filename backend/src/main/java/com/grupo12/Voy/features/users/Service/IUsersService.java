package com.grupo12.Voy.features.users.Service;

import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketUsersDto;
import com.grupo12.Voy.features.users.Dto.NewUserDto;
import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.Dto.UserFollowDto;
import com.grupo12.Voy.features.users.Dto.UserUpdateDto;

import java.util.List;
import java.util.UUID;

public interface IUsersService {
    UserDto findByExternalId(UUID userUuid);
    List<UserDto> getAll(String username, String email);
    void deleteUser(UUID externalId);
    UserDto newUser(NewUserDto newUserDto);
    UserDto updateUser(UUID userUuid, UserUpdateDto userUpdateDto);
    List<UserFollowDto> listFollowList(UUID userUuid);
    List<UserFollowDto> alterFollow(UUID userId, UUID otherUserId);
    List<UserFollowDto> listFollowersList(UUID userUuid);
    List<PartyUsersDto> listMyParties(UUID userId);
    List<PartyUsersDto> listFollowedParties(UUID userUuid);
    List<PartyUsersDto> alterFollowParty(UUID userId, UUID partyId);
    List<TicketUsersDto> listTickets(UUID userUuid);
    List<ReceiptResponseDTO> listReceipt(UUID userUuid);
    UserDto userToPublic (UUID idUser);
}
