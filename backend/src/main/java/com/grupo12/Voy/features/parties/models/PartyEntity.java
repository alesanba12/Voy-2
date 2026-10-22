package com.grupo12.Voy.features.parties.models;

import com.grupo12.Voy.features.tags.models.TagEntity;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
@Getter
@Setter
@Entity
@Table(name = "eventos")
public class PartyEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_evento")
    private Long idParty;

    private UUID externalId;

    @ManyToOne
    @JoinColumn(name = "id_organizador", nullable = false)
    private UserEntity organizer;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "party_co_organizers",
            joinColumns = @JoinColumn(name = "id_party"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario")
    )
    private List<UserEntity> coOrganizer = new ArrayList<>();

    @Column(name = "titulo", nullable = false,unique = true)
    private String title;

    @Column(name = "precio",nullable = false)
    private BigDecimal price;

    @Column(name = "tipo")
    @ColumnDefault("False")
    private Boolean partyAccesibility; // publico/privado

    @ManyToMany
    @JoinTable(name = "etiquetas_por_evento",
            joinColumns = @JoinColumn(name = "evento_id"),
            inverseJoinColumns = @JoinColumn(name = "etiquetas_id"))
    private List<TagEntity> tagsList = new ArrayList<>();

    @Column(name = "localidad")
    private String city;

    @Column(name = "direccion")
    private String adress;

    @Column(name = "estado")
    @ColumnDefault("true")
    private Boolean logicState;

    private Integer guestLimit;

    @OneToMany
    private List<TicketEntity> ticketsParty;

    @Column(name = "descripcion", columnDefinition = "TEXT")
    private String description;

    @OneToMany(fetch = FetchType.LAZY,cascade = CascadeType.ALL)
    private List<TicketEntity> usersList;

    private LocalDateTime dateTime;

    private Boolean state;

    @PrePersist
    public void onSave() {
        if (externalId == null) externalId = UUID.randomUUID();
        if (state == null) state = true;
        if (logicState == null) logicState = true;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof PartyEntity that)) return false;
        return externalId != null && externalId.equals(that.externalId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
