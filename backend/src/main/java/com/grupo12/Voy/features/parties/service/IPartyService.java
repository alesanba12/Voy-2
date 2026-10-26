package com.grupo12.Voy.features.parties.service;

import com.grupo12.Voy.features.parties.Dto.PartyReqDTO;
import com.grupo12.Voy.features.parties.Dto.PartyReqPrivateDto;
import com.grupo12.Voy.features.parties.Dto.PartyResDTO;
import com.grupo12.Voy.features.tags.dto.TagsDTO;

import java.util.List;
import java.util.UUID;

public interface IPartyService {

    List<PartyResDTO> getAll(UUID partyId, UUID organizerId, String title, String city);

    PartyResDTO getByExternalId(UUID id);
    PartyResDTO getById(UUID id, UUID currentUserId);

    PartyResDTO createPublic(PartyReqDTO dto, UUID currentUserId);

    PartyResDTO createPrivate(PartyReqPrivateDto dto, UUID currentUserId);

    PartyResDTO update(UUID idExternal, PartyReqDTO dto);

    PartyResDTO addTag(UUID id, TagsDTO nameTag);

    void removeTag(UUID id, TagsDTO nameTag);

    void delete(UUID idExternal);

    PartyResDTO addCoOrganizrer(UUID user, UUID idExternal, UUID coOrg);

    PartyResDTO removeCoOrganizrer(UUID user, UUID idExternal, UUID coOrg);

    PartyResDTO changePartyStatus(UUID id);
}