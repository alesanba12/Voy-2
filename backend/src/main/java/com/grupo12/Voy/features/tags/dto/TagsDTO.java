package com.grupo12.Voy.features.tags.dto;

import jakarta.validation.constraints.NotBlank;
import org.hibernate.validator.constraints.Length;

public record TagsDTO(@NotBlank(message = "El nombre no puede estar vacio")
                      @Length(max = 30,message = "El nombre no puede tener mas de 30 caracteres")
                      String name){
}