package com.grupo12.Voy.features.tags;

import com.grupo12.Voy.features.tags.models.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TagsRepository extends JpaRepository<TagEntity,Long>, JpaSpecificationExecutor<TagEntity> {
    Optional<TagEntity> findByName(String name);
    List<TagEntity> findByNameIn(Collection<String> names);
}
