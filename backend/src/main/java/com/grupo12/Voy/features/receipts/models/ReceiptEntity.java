package com.grupo12.Voy.features.receipts.models;

import com.grupo12.Voy.features.receipts.Status;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "facturas")
public class ReceiptEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "recibo_id")
    private Long id;

    private UUID externalId;

    @Column(name = "precio")
    private BigDecimal price;

    @Column(name = "metodo_de_pago")
    private String paymentMethod;

    @Column(name = "precio_final")
    private BigDecimal finalPrice;

    @Column(name = "fecha_compra")
    private LocalDateTime paymentDate;

    @Column(name = "cantidad")
    private Integer quantity;

    @Column(name = "estado")
    private Status status;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private UserEntity user;

    @PrePersist
    public void onSave(){
        if(externalId == null){
            externalId = UUID.randomUUID();
        }
    }
}
