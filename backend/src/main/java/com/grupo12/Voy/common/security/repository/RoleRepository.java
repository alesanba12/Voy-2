package com.grupo12.Voy.common.security.repository;

import com.grupo12.Voy.common.security.enums.Roles;
import com.grupo12.Voy.common.security.models.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<RoleEntity,Long> {
    RoleEntity findByRole(Roles roles);
}
