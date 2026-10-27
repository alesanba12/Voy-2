package com.grupo12.Voy.features.organizers.mapper;

import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.models.OrganizerVerificationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrganizerVerificationMapper {

    @Mapping(target = "userExternalId", source = "user.externalId")
    @Mapping(target = "userEmail", source = "user.email")
    OrganizerVerificationResDTO toDto(OrganizerVerificationEntity entity);
}