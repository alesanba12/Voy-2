package com.grupo12.Voy.features.users.Mapper;

import com.grupo12.Voy.features.users.Dto.UserFollowDto;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserFollowMapper {
    UserEntity toEntity (UserFollowDto userFollowDto);
    UserFollowDto toDto (UserEntity userEntity);

}
