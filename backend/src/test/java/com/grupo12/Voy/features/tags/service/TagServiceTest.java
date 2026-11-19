package com.grupo12.Voy.features.tags.service;

import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.InvalidFieldException;
import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.tags.TagsRepository;
import com.grupo12.Voy.features.tags.dto.DeleteTagReqDTO;
import com.grupo12.Voy.features.tags.mappers.TagMapper;
import com.grupo12.Voy.features.tags.models.TagEntity;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TagServiceTest {

    @Mock
    private TagsRepository tagsRepository;

    @Mock
    private PartyRepository partyRepository;

    @Mock
    private TagMapper tagMapper;

    @InjectMocks
    private TagService tagService;

    @Test
    @DisplayName("delete: cuando la etiqueta no existe debe lanzar EntityNotFoundException")
    void delete_whenTagNotFound_shouldThrowEntityNotFoundException() {
        // Arrange
        DeleteTagReqDTO dto = new DeleteTagReqDTO("Inexistente", null);
        when(tagsRepository.findByName("Inexistente")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> tagService.delete(dto));
        verify(tagsRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: cuando la etiqueta de reemplazo es idéntica a la que se elimina debe lanzar InvalidFieldException")
    void delete_whenReplacementIsSameAsTarget_shouldThrowInvalidFieldException() {
        // Arrange
        TagEntity tag = TagEntity.builder().tagsId(1L).name("Cachengue").build();
        DeleteTagReqDTO dto = new DeleteTagReqDTO("Cachengue", "Cachengue");
        when(tagsRepository.findByName("Cachengue")).thenReturn(Optional.of(tag));

        // Act & Assert
        assertThrows(InvalidFieldException.class, () -> tagService.delete(dto));
        verify(tagsRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: cuando la etiqueta no tiene fiestas asociadas, se elimina directamente")
    void delete_whenNoPartiesAssociated_shouldDeleteDirectly() {
        // Arrange
        TagEntity tag = TagEntity.builder().tagsId(1L).name("Pop").build();
        DeleteTagReqDTO dto = new DeleteTagReqDTO("Pop", null);

        when(tagsRepository.findByName("Pop")).thenReturn(Optional.of(tag));
        when(partyRepository.findAllPartiesByTagId(1L)).thenReturn(List.of());

        // Act
        tagService.delete(dto);

        // Assert
        verify(partyRepository, never()).saveAll(any());
        verify(tagsRepository).delete(tag);
    }

    @Test
    @DisplayName("delete: cuando los eventos asociados tienen más de 1 etiqueta, se desvincula sin requerir reemplazo")
    void delete_whenPartiesHaveMultipleTags_shouldRemoveTagWithoutReplacement() {
        // Arrange
        TagEntity tagToDelete = TagEntity.builder().tagsId(1L).name("Techno").build();
        TagEntity otherTag = TagEntity.builder().tagsId(2L).name("House").build();

        PartyEntity party = new PartyEntity();
        party.setIdParty(10L);
        party.setTagsList(new ArrayList<>(List.of(tagToDelete, otherTag)));

        DeleteTagReqDTO dto = new DeleteTagReqDTO("Techno", null);

        when(tagsRepository.findByName("Techno")).thenReturn(Optional.of(tagToDelete));
        when(partyRepository.findAllPartiesByTagId(1L)).thenReturn(List.of(party));

        // Act
        tagService.delete(dto);

        // Assert
        assertThat(party.getTagsList()).containsExactly(otherTag);
        verify(partyRepository).saveAll(List.of(party));
        verify(tagsRepository).delete(tagToDelete);
    }

    @Test
    @DisplayName("delete: cuando un evento se queda sin etiquetas y no se provee reemplazo debe lanzar NotAllowedException")
    void delete_whenPartyWouldBeLeftEmptyAndNoReplacement_shouldThrowNotAllowedException() {
        // Arrange
        TagEntity tagToDelete = TagEntity.builder().tagsId(1L).name("Trap").build();

        PartyEntity party = new PartyEntity();
        party.setIdParty(10L);
        party.setTagsList(new ArrayList<>(List.of(tagToDelete)));

        DeleteTagReqDTO dto = new DeleteTagReqDTO("Trap", null);

        when(tagsRepository.findByName("Trap")).thenReturn(Optional.of(tagToDelete));
        when(partyRepository.findAllPartiesByTagId(1L)).thenReturn(List.of(party));

        // Act & Assert
        assertThrows(NotAllowedException.class, () -> tagService.delete(dto));
        verify(partyRepository, never()).saveAll(any());
        verify(tagsRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: cuando un evento se queda sin etiquetas pero la etiqueta de reemplazo no existe debe lanzar EntityNotFoundException")
    void delete_whenReplacementTagNotFound_shouldThrowEntityNotFoundException() {
        // Arrange
        TagEntity tagToDelete = TagEntity.builder().tagsId(1L).name("Reggae").build();

        PartyEntity party = new PartyEntity();
        party.setIdParty(10L);
        party.setTagsList(new ArrayList<>(List.of(tagToDelete)));

        DeleteTagReqDTO dto = new DeleteTagReqDTO("Reggae", "ReemplazoInexistente");

        when(tagsRepository.findByName("Reggae")).thenReturn(Optional.of(tagToDelete));
        when(partyRepository.findAllPartiesByTagId(1L)).thenReturn(List.of(party));
        when(tagsRepository.findByName("ReemplazoInexistente")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(EntityNotFoundException.class, () -> tagService.delete(dto));
        verify(partyRepository, never()).saveAll(any());
        verify(tagsRepository, never()).delete(any());
    }

    @Test
    @DisplayName("delete: cuando un evento se queda sin etiquetas y se provee reemplazo válido, asigna el reemplazo y elimina la etiqueta")
    void delete_whenPartyWouldBeLeftEmptyAndValidReplacement_shouldAssignReplacement() {
        // Arrange
        TagEntity tagToDelete = TagEntity.builder().tagsId(1L).name("Reggaeton").build();
        TagEntity replacementTag = TagEntity.builder().tagsId(5L).name("General").build();

        PartyEntity party = new PartyEntity();
        party.setIdParty(10L);
        party.setTagsList(new ArrayList<>(List.of(tagToDelete)));

        DeleteTagReqDTO dto = new DeleteTagReqDTO("Reggaeton", "General");

        when(tagsRepository.findByName("Reggaeton")).thenReturn(Optional.of(tagToDelete));
        when(partyRepository.findAllPartiesByTagId(1L)).thenReturn(List.of(party));
        when(tagsRepository.findByName("General")).thenReturn(Optional.of(replacementTag));

        // Act
        tagService.delete(dto);

        // Assert
        assertThat(party.getTagsList()).containsExactly(replacementTag);
        verify(partyRepository).saveAll(List.of(party));
        verify(tagsRepository).delete(tagToDelete);
    }
}
