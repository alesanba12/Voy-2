package com.grupo12.Voy.features.tags.models;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "etiquetas")
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class TagEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "etiquetas_id")
    private Long tagsId;

    @Column(name = "nombre", unique = true, nullable = false)
    private String name;
}
