package com.grupo12.Voy.features.parties.mapper;

import com.grupo12.Voy.features.parties.Dto.PartyReqDTO;
import com.grupo12.Voy.features.parties.Dto.PartyReqPrivateDto;
import com.grupo12.Voy.features.parties.Dto.PartyResDTO;
import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.tags.models.TagEntity;
import com.grupo12.Voy.features.users.Mapper.UserMapper;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", uses = UserMapper.class)
public interface PartyMapper {
    @Mapping(source = "organizer.email", target = "organizerName")
    @Mapping(source = "coOrganizer", target = "coOrganizerName", qualifiedByName = "usersToEmails")
    @Mapping(source = "tagsList", target = "tags")
    PartyResDTO toResDTO (PartyEntity party);

    List<PartyResDTO> toResDTOList (List<PartyEntity> parties);

    PartyEntity toEntity(PartyReqDTO partyReqDTO);
    PartyEntity toEntity(PartyReqPrivateDto partyResDTO);

    PartyUsersDto toUserFromEntity(PartyEntity party);

    @Named("usersToEmails")
    default Set<String> usersToEmails(List<UserEntity> users) {
        if (users == null) return Collections.emptySet();
        return users.stream()
                .map(UserEntity::getEmail)
                .collect(Collectors.toSet());
    }

    default Set<String> tagsToStrings(List<TagEntity> tags ){
        if(tags==null) return null;
        return tags.stream()
                .map(TagEntity::getName)
                .collect(Collectors.toSet());
    }

    default TagEntity stringToTag(String name) {
        if (name == null) return null;
        TagEntity tag = new TagEntity();
        tag.setName(name);
        return tag;
    }
}
