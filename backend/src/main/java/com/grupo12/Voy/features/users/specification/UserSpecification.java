package com.grupo12.Voy.features.users.specification;

import com.grupo12.Voy.features.users.models.UserEntity;
import org.springframework.data.jpa.domain.PredicateSpecification;

public class UserSpecification {
    public static PredicateSpecification<UserEntity> usernameContains(String username){
        return ((root,cb) -> username==null || username.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("username")), "%" + username.toLowerCase() +"%"));
    }

    public static PredicateSpecification<UserEntity> emailContains(String email){
        return ((root,cb) -> email==null || email.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("email")), "%" + email.toLowerCase() +"%"));
    }
}
