package com.grupo12.Voy.features.users.Mapper;

import com.grupo12.Voy.features.users.Dto.NewUserDto;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface NewUserDtoMapper {

    UserEntity newUserToEntity (NewUserDto newUserDto);
    NewUserDto entityToNewUser(UserEntity userEntity);
}
