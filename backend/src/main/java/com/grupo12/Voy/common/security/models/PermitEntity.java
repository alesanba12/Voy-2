package com.grupo12.Voy.common.security.models;

import com.grupo12.Voy.common.security.enums.Permits;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PermitEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, unique = true)
    Permits permit;
}

