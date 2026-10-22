package com.grupo12.Voy.features.tags.mappers;

import com.grupo12.Voy.features.tags.dto.TagsDTO;
import com.grupo12.Voy.features.tags.models.TagEntity;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TagMapper {

    TagsDTO toDto(TagEntity tags);

    TagEntity toEntity(TagsDTO tagsDTO);
}
