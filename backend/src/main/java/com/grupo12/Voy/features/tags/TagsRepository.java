package com.grupo12.Voy.features.tags;

import com.grupo12.Voy.features.tags.models.TagEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface TagsRepository extends JpaRepository<TagEntity,Long>, JpaSpecificationExecutor<TagEntity> {
    Optional<TagEntity> findByName(String name);
    List<TagEntity> findByNameIn(Collection<String> names);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END " +
            "FROM etiquetas_por_evento WHERE etiquetas_id = :tagId",
            nativeQuery = true)
    boolean isTagInUse(@Param("tagId") Long tagId);
}
