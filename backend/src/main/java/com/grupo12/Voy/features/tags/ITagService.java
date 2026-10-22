package com.grupo12.Voy.features.tags;

import com.grupo12.Voy.features.tags.dto.TagsDTO;

import java.util.List;

public interface ITagService {
    List<TagsDTO> findAll(String name);

    TagsDTO save(TagsDTO tagsDTO);

    TagsDTO update(String oldName, TagsDTO tagsDTO);

    void delete(TagsDTO tagsDTO);
}
