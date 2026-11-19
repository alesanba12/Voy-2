package com.grupo12.Voy.features.organizers.repository;

import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.models.OrganizerVerificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrganizerVerificationRepository extends JpaRepository<OrganizerVerificationEntity, Long> {


    Optional<OrganizerVerificationEntity> findByUserExternalId(UUID externalId);

    List<OrganizerVerificationEntity> findByStatus(VerificationStatus status);

    Page<OrganizerVerificationEntity> findByStatus(VerificationStatus status, Pageable pageable);

    long countByStatus(VerificationStatus status);
}
