package com.grupo12.Voy.features.receipts;

import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.users.models.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReceiptRepository extends JpaRepository<ReceiptEntity,Long>, JpaSpecificationExecutor<ReceiptEntity> {
    Optional<ReceiptEntity> findByExternalId(UUID id);
    List<ReceiptEntity> findByPaymentMethod(String method);
    List<ReceiptEntity> findByUser(UserEntity user);
}
