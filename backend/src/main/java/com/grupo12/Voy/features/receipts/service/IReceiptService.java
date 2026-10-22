package com.grupo12.Voy.features.receipts.service;

import com.grupo12.Voy.features.receipts.DTO.ReceiptRequestDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface IReceiptService {
    List<ReceiptResponseDTO> getAllAdmin(
            UUID externalId, UUID userExtId,String paymentMethod,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minFinalPrice, BigDecimal maxFinalPrice,
            LocalDateTime from, LocalDateTime to,
            Integer minQuantity, Integer maxQuantity);
    List<ReceiptResponseDTO> getAll(
            UUID externalId, UUID userExtId,String paymentMethod,
            BigDecimal minPrice, BigDecimal maxPrice,
            BigDecimal minFinalPrice, BigDecimal maxFinalPrice,
            LocalDateTime from, LocalDateTime to,
            Integer minQuantity, Integer maxQuantity);
    ReceiptResponseDTO createReceipt(ReceiptRequestDTO dto);
    void deleteReceipt(UUID externalID);
}
