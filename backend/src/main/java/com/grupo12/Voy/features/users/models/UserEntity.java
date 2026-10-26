package com.grupo12.Voy.features.users.models;

import com.grupo12.Voy.common.security.models.CredentialsEntity;
import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.tickets.models.TicketEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name ="usuarios")
@Getter
@Setter
@AllArgsConstructor
@Builder
@NoArgsConstructor
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "external_id",nullable = false,unique = true)
    private UUID externalId;

    @Column(name = "usuario",nullable = false,unique = true)
    private String username;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "accesibilidad",nullable = false)
    private Boolean isOrganizer;

    @Column(name = "fecha_nacimiento",nullable = false)
    private LocalDate birthdate;

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "usuarios_seguidos",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_seguido")
    )
    private Set<UserEntity> followsList = new HashSet<>();

    @Builder.Default
    @ManyToMany(mappedBy = "followsList")
    private Set<UserEntity> followersList = new HashSet<>();

    @Builder.Default
    @ManyToMany
    @JoinTable(
            name = "eventos_seguidos",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_evento")
    )
    private Set<PartyEntity> followedParties = new HashSet<>();

    @Builder.Default
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "organizer")
    private List<PartyEntity> myParties = new ArrayList<>();

    @Builder.Default
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
    private List<TicketEntity> myTickets = new ArrayList<>();

    @Builder.Default
    @OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
    private List<ReceiptEntity> myReceipts = new ArrayList<>();

    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL, orphanRemoval = true)
    private CredentialsEntity credentials;

    @PrePersist
    public void onSave(){
        if(externalId==null) externalId = UUID.randomUUID();
        if(isOrganizer ==null) isOrganizer = false;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserEntity that)) return false;
        return externalId != null && externalId.equals(that.externalId);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
