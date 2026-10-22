package com.grupo12.Voy.features.receipts.service;

import com.grupo12.Voy.common.exceptions.NotAllowedException;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptRequestDTO;
import com.grupo12.Voy.features.receipts.ReceiptRepository;
import com.grupo12.Voy.features.receipts.Status;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.receipts.ReceiptMapper;
import com.grupo12.Voy.features.receipts.specification.ReceiptSpecification;
import com.grupo12.Voy.features.users.UserRepository;
import com.grupo12.Voy.features.users.models.UserEntity;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.data.jpa.domain.PredicateSpecification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@AllArgsConstructor
public class ReceiptsService implements IReceiptService {

    private final ReceiptRepository receiptRepository;
    private final UserRepository userRepository;
    private final ReceiptMapper receiptMapper;

    @Override
    public List<ReceiptResponseDTO> getAllAdmin(
            UUID externalId,
            UUID userExtId,
            String paymentMethod,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minFinalPrice,
            BigDecimal maxFinalPrice,
            LocalDateTime from,
            LocalDateTime to,
            Integer minQuantity,
            Integer maxQuantity) {

        PredicateSpecification<ReceiptEntity> spec = ReceiptSpecification.externalIdEqual(externalId)
                .and(ReceiptSpecification.userExtIdEqual(userExtId))
                .and(ReceiptSpecification.paymentMethodContains(paymentMethod))
                .and(ReceiptSpecification.priceBetween(minPrice, maxPrice))
                .and(ReceiptSpecification.finalPriceBetween(minFinalPrice, maxFinalPrice))
                .and(ReceiptSpecification.paymentDateBetween(from, to))
                .and(ReceiptSpecification.quantityBetween(minQuantity, maxQuantity));

        return receiptRepository
                .findAll(spec)
                .stream()
                .map(receiptMapper::toResponseDTO)
                .toList();
    }

    @Override
    public List<ReceiptResponseDTO> getAll(
            UUID externalId,
            UUID userExtId,
            String paymentMethod,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            BigDecimal minFinalPrice,
            BigDecimal maxFinalPrice,
            LocalDateTime from,
            LocalDateTime to,
            Integer minQuantity,
            Integer maxQuantity) {

        PredicateSpecification<ReceiptEntity> spec = ReceiptSpecification.externalIdEqual(externalId)
                .and(ReceiptSpecification.userExtIdEqual(userExtId))
                .and(ReceiptSpecification.paymentMethodContains(paymentMethod))
                .and(ReceiptSpecification.priceBetween(minPrice, maxPrice))
                .and(ReceiptSpecification.finalPriceBetween(minFinalPrice, maxFinalPrice))
                .and(ReceiptSpecification.paymentDateBetween(from, to))
                .and(ReceiptSpecification.quantityBetween(minQuantity, maxQuantity));

        return receiptRepository
                .findAll(spec)
                .stream()
                .map(receiptMapper::toResponseDTO)
                .toList();
    }

    @Transactional
    public ReceiptResponseDTO createReceipt(ReceiptRequestDTO dto){
        UserEntity user = userRepository
                .findByEmail(dto.user().email())
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el usuario"));
        ReceiptEntity receipt = receiptMapper.toEntity(dto);
        if (dto.price().doubleValue() == 0.0 ){
            receipt.setStatus(Status.APROBADA);
        }else{
            receipt.setStatus(Status.PENDIENTE);
        }
        receipt.setFinalPrice(receipt.getPrice().multiply(BigDecimal.valueOf(receipt.getQuantity())));
        receipt.setPaymentDate(LocalDateTime.now());
        receipt.setUser(user);
        receiptRepository.save(receipt);
        return receiptMapper.toResponseDTO(receipt);
    }

    @Transactional
    public void deleteReceipt(UUID externalID){
        ReceiptEntity receipt = receiptRepository
                .findByExternalId(externalID)
                .orElseThrow(() -> new EntityNotFoundException("No se encuentra el recibo"));
        if(!receipt.getStatus().equals(Status.RECHAZADA)){
            throw new NotAllowedException("Solo se puede eliminar un recibo de compra cuando la misma fue rechazada");
        }
        receiptRepository.delete(receipt);
    }
}
