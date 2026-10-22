package com.grupo12.Voy.features.tickets.specification;

import com.grupo12.Voy.features.tickets.models.TicketEntity;
import org.springframework.data.jpa.domain.PredicateSpecification;

import java.util.UUID;

public class TicketSpecification {

    public static PredicateSpecification<TicketEntity> externalIdEqual(UUID externalId) {
        return (root, cb) -> externalId == null ?
                cb.conjunction() :
                cb.equal(root.get("idExternal"), externalId);
    }

    public static PredicateSpecification<TicketEntity> isConfirmed(Boolean confirmed) {
        return (root, cb) -> confirmed == null ?
                cb.conjunction() :
                cb.equal(root.get("confirmed"), confirmed);
    }

    public static PredicateSpecification<TicketEntity> partyTitleContains(String title) {
        return (root, cb) -> title == null || title.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("party").get("title")), "%" + title.toLowerCase() + "%");
    }

    public static PredicateSpecification<TicketEntity> partyOrganizerNameContains(String username) {
        return (root, cb) -> username == null || username.isBlank() ?
                cb.conjunction() :
                cb.like(cb.lower(root.get("party").get("organizer").get("username")),
                        "%" + username.toLowerCase() + "%");
    }

    public static PredicateSpecification<TicketEntity> userUsernameContains(String username) {
        return (root, cb) -> username == null || username.isBlank()?
                cb.conjunction() :
                cb.like(cb.lower(root.get("user").get("username")), "%" + username.toLowerCase() + "%");
    }
}
