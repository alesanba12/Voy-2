package com.grupo12.Voy.features.users.Dto;

import java.util.UUID;

public record UserDto(UUID externalId, String username, String email){

}
