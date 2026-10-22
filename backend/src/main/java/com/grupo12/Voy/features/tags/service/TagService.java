package com.grupo12.Voy.features.tags.service;

import com.grupo12.Voy.common.exceptions.EntityDuplicatedException;
import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.InvalidFieldException;
import com.grupo12.Voy.features.tags.ITagService;
import com.grupo12.Voy.features.tags.TagsRepository;
import com.grupo12.Voy.features.tags.dto.TagsDTO;
import com.grupo12.Voy.features.tags.mappers.TagMapper;
import com.grupo12.Voy.features.tags.models.TagEntity;
import com.grupo12.Voy.features.tags.specification.TagSpecification;
import lombok.AllArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@AllArgsConstructor
public class TagService implements ITagService {
    private final TagsRepository tagsRepository;

    @Autowired
    private TagMapper tagMapper;

    @Override
    public List<TagsDTO> findAll(String name){
        PredicateSpecification<TagEntity> spec = PredicateSpecification.allOf(
                TagSpecification.nameLike(name)
        );

        return tagsRepository
                .findAll(spec)
                .stream()
                .map(tagMapper::toDto)
                .toList();
    }

    @Override
    public TagsDTO save(TagsDTO tagsDTO){
        if(tagsRepository
                .findAll()
                .stream()
                .anyMatch(tagEntity -> tagEntity
                        .getName()
                        .equals(tagsDTO.name())))
                throw new EntityDuplicatedException("La etiqueta ya existe");
        return tagMapper.toDto(tagsRepository
                .save(tagMapper.toEntity(tagsDTO)));
    }

    @Override
    public TagsDTO update(String oldname, TagsDTO tagsDTO){
        TagEntity tag = tagsRepository
                .findByName(oldname)
                .orElseThrow(() -> new EntityNotFoundException("Etiqueta no encontrada"));
        tag.setName(tagsDTO.name());
        return tagMapper.toDto(tagsRepository.save(tag));
    }

    @Override
    public void delete(TagsDTO tagsDTO){
        TagEntity tag = tagsRepository
                .findByName(tagsDTO.name())
                .orElseThrow(() -> new EntityNotFoundException("Etiqueta no encontrada"));
        tagsRepository.delete(tag);
    }
}
