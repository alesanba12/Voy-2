package com.grupo12.Voy.common.security.repository;

import com.grupo12.Voy.common.security.models.PermitEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PermitRepository extends JpaRepository<PermitEntity,Long> {
}
