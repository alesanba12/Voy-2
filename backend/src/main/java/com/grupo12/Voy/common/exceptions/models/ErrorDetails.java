package com.grupo12.Voy.common.exceptions.models;

import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record ErrorDetails(String message,
                           String endpoint,
                           LocalDateTime dateTime){


}
