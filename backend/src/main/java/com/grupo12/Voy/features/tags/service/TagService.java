package com.grupo12.Voy.features.tags.service;

import com.grupo12.Voy.common.exceptions.EntityDuplicatedException;
import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.InvalidFieldException;
import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.tags.ITagService;
import com.grupo12.Voy.features.tags.TagsRepository;
import com.grupo12.Voy.features.tags.dto.DeleteTagReqDTO;
import com.grupo12.Voy.features.tags.dto.TagsDTO;
import com.grupo12.Voy.features.tags.mappers.TagMapper;
import com.grupo12.Voy.features.tags.models.TagEntity;
import com.grupo12.Voy.features.tags.specification.TagSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TagService implements ITagService {
    private final TagsRepository tagsRepository;
    private final PartyRepository partyRepository;
    private final TagMapper tagMapper;

    @Override
    @Transactional(readOnly = true)
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
    @Transactional
    public TagsDTO save(TagsDTO tagsDTO){
        if(tagsRepository
                .findAll()
                .stream()
                .anyMatch(tagEntity -> tagEntity
                        .getName()
                        .equalsIgnoreCase(tagsDTO.name())))
                throw new EntityDuplicatedException("La etiqueta ya existe");
        return tagMapper.toDto(tagsRepository
                .save(tagMapper.toEntity(tagsDTO)));
    }

    @Override
    @Transactional
    public TagsDTO update(String oldname, TagsDTO tagsDTO){
        TagEntity tag = tagsRepository
                .findByName(oldname)
                .orElseThrow(() -> new EntityNotFoundException("Etiqueta no encontrada"));
        tag.setName(tagsDTO.name());
        return tagMapper.toDto(tagsRepository.save(tag));
    }

    @Override
    @Transactional
    public void delete(DeleteTagReqDTO deleteDTO){
        TagEntity tagToDelete = tagsRepository
                .findByName(deleteDTO.tagName())
                .orElseThrow(() -> new EntityNotFoundException("Etiqueta no encontrada"));

        if (deleteDTO.replacementTagName() != null && 
            deleteDTO.replacementTagName().trim().equalsIgnoreCase(deleteDTO.tagName().trim())) {
            throw new InvalidFieldException("La etiqueta de reemplazo no puede ser la misma que la etiqueta a eliminar");
        }

        List<PartyEntity> associatedParties = partyRepository.findAllPartiesByTagId(tagToDelete.getTagsId());

        if (!associatedParties.isEmpty()) {
            boolean hasPartiesLeavingEmpty = associatedParties.stream()
                    .anyMatch(party -> party.getTagsList().size() == 1 &&
                            party.getTagsList().getFirst().getTagsId().equals(tagToDelete.getTagsId()));

            TagEntity replacementTag = null;
            if (hasPartiesLeavingEmpty) {
                if (deleteDTO.replacementTagName() == null || deleteDTO.replacementTagName().trim().isBlank()) {
                    throw new NotAllowedException("No se puede eliminar la etiqueta porque dejaría eventos sin etiquetas. Debe proporcionar una etiqueta de reemplazo.");
                }

                replacementTag = tagsRepository
                        .findByName(deleteDTO.replacementTagName().trim())
                        .orElseThrow(() -> new EntityNotFoundException("La etiqueta de reemplazo '" + deleteDTO.replacementTagName() + "' no existe"));
            }

            for (PartyEntity party : associatedParties) {
                party.getTagsList().removeIf(t -> t.getTagsId().equals(tagToDelete.getTagsId()));

                if (party.getTagsList().isEmpty() && replacementTag != null) {
                    party.getTagsList().add(replacementTag);
                }
            }

            partyRepository.saveAll(associatedParties);
        }

        tagsRepository.delete(tagToDelete);
    }
}
