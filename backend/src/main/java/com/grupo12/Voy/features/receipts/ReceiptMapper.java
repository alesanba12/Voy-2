package com.grupo12.Voy.features.receipts;

import com.grupo12.Voy.features.receipts.DTO.ReceiptRequestDTO;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.models.ReceiptEntity;
import com.grupo12.Voy.features.users.Mapper.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ReceiptMapper {

    ReceiptResponseDTO toResponseDTO(ReceiptEntity entity);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "externalId", ignore = true)
    @Mapping(target = "finalPrice", ignore = true)
    @Mapping(target = "paymentDate", ignore = true)
    @Mapping(target = "user", ignore = true)
    ReceiptEntity toEntity(ReceiptRequestDTO request);

    ReceiptEntity toEntityFromResponse(ReceiptResponseDTO responseDTO);
}
