package com.grupo12.Voy.common.security.repository;

import com.grupo12.Voy.common.security.models.CredentialsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CredentialsRepository extends JpaRepository<CredentialsEntity,Long> {
    Optional<CredentialsEntity> findByUsername(String username);
}
