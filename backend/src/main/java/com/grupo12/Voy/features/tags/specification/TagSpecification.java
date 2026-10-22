package com.grupo12.Voy.features.tags.specification;

import com.grupo12.Voy.features.tags.models.TagEntity;
import org.springframework.data.jpa.domain.PredicateSpecification;

public class TagSpecification {
    public static PredicateSpecification<TagEntity> nameLike(String name){
        return ((root,cb) -> name == null || name.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("name")),name.toLowerCase()));
    }
}
