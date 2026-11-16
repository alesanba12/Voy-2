package com.grupo12.Voy.features.users;

import com.grupo12.Voy.features.users.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;


import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<UserEntity,Long>, JpaSpecificationExecutor<UserEntity> {
    Optional <UserEntity> findByEmail(String userEmail);
    Optional<UserEntity> findByExternalId(UUID productId);
    Boolean existsByEmail(String email);
    Boolean existsByUsername(String username);

    @Query("SELECT COUNT(u) FROM UserEntity u JOIN u.credentials c WHERE c.enabled = true")
    long countActiveUsers();
}
