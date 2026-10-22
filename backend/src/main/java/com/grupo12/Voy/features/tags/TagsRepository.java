package com.grupo12.Voy.features.tags;

import com.grupo12.Voy.features.tags.dto.TagsDTO;
import com.grupo12.Voy.features.tags.models.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface TagsRepository extends JpaRepository<TagEntity,Long>, JpaSpecificationExecutor<TagEntity> {
    Optional<TagEntity> findByName(String name);
}
