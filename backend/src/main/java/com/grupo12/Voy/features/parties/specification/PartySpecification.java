package com.grupo12.Voy.features.parties.specification;

import com.grupo12.Voy.features.parties.models.PartyEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.PredicateSpecification;

import java.time.LocalDate;
import java.util.UUID;

public class PartySpecification {
    public static PredicateSpecification<PartyEntity> externalIdEqual(UUID externalId){
        return ((root,cb) -> externalId == null ?
                cb.conjunction() :
                cb.equal(root.get("externalId"),externalId));
    }

    public static PredicateSpecification<PartyEntity> externalIdOrganizerEqual(UUID externalId){
        return ((root,cb) -> externalId == null ?
                cb.conjunction() :
                cb.equal(root.get("organizer").get("externalId"),externalId));
    }

    public static PredicateSpecification<PartyEntity> titleContains(String title){
        return ((root,cb) -> title == null || title.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("title")),title.toLowerCase()));
    }

    public static PredicateSpecification<PartyEntity> isPublic(Boolean isPublic){
        return ((root,cb) -> isPublic == null ?
                cb.conjunction() :
                cb.equal(root.get("partyAccesibility"),isPublic));
    }

    public static PredicateSpecification<PartyEntity> cityContains(String city) {
        return (root, cb) -> city == null || city.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("city")), "%" + city.toLowerCase() + "%");
    }

    public static PredicateSpecification<PartyEntity> betweenDates(LocalDate from, LocalDate to){
        return (root, cb) -> {
            Predicate result = cb.conjunction();
            if (from != null) {
                result = cb.and(result,
                        cb.greaterThanOrEqualTo(root.get("dateTime"), from.atStartOfDay()));
            }
            if (to != null) {
                result = cb.and(result,
                        cb.lessThan(root.get("dateTime"), to.plusDays(1).atStartOfDay()));
            }
            return result;
        };
    }

    public static PredicateSpecification<PartyEntity> stateTrue(){
        return ((root,cb) -> cb.isTrue(root.get("logicState")));
    }
}
