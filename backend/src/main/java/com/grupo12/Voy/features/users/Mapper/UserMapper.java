package com.grupo12.Voy.features.users.Mapper;

import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserEntity userToEntity(UserDto userDto);
    UserDto userToDto(UserEntity userEntity);
}
