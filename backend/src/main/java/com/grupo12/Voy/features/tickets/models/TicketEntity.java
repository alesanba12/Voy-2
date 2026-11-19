package com.grupo12.Voy.features.tickets.models;

import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.ColumnDefault;

import java.util.UUID;

@Entity
@Table(name = "entradas")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TicketEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_entrada")
    private Long idTicket;

    private UUID idExternal;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "id_evento", nullable = false)
    private PartyEntity party;

    private Boolean confirmed;

    @Column(nullable = false)
    @ColumnDefault("false")
    private Boolean checkedIn;

    @ManyToOne
    @JoinColumn(name = "id_factura", nullable = false)
    private ReceiptEntity receiptEntity;

    @PrePersist
    public void onSave(){
        if(idExternal == null){
            idExternal = UUID.randomUUID();
        }
        if(confirmed == null){
            confirmed = true; //TODO TRUE PARA NO TENER QUE VALIDAR CADA ENTRADA
        }
        if(checkedIn == null){
            checkedIn = false;
        }
    }
}
