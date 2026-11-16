package com.grupo12.Voy.features.parties.repository;

import com.grupo12.Voy.features.parties.models.PartyEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PartyRepository extends JpaRepository<PartyEntity,Long>, JpaSpecificationExecutor<PartyEntity> {
    Optional<PartyEntity> findByExternalIdAndLogicStateTrue(UUID externalId);
    Boolean existsByTitle(String title);
    // PartyRepository
    List<PartyEntity> findByDateTimeBeforeAndLogicStateTrue(LocalDateTime dateTime);

    @Query("SELECT COUNT(p) FROM PartyEntity p WHERE p.logicState = true AND p.hasPassed = false")
    long countActiveParties();
}
