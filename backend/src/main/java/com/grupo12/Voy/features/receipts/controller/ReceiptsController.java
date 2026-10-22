package com.grupo12.Voy.features.receipts.controller;

import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.receipts.service.IReceiptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.AllArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/receipts")
public class ReceiptsController {
    private final IReceiptService receiptsService;

    @Operation(
            summary = "Buscar recibos (admin)",
            description = "Permite a un administrador buscar y filtrar recibos de cualquier usuario por múltiples criterios."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de recibos obtenido correctamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReceiptResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de ADMIN", content = @Content)
    })
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<List<ReceiptResponseDTO>> searchAdmin(
            @RequestParam(required = false) UUID externalId,
            @RequestParam(required = false) UUID userExtId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minFinalPrice,
            @RequestParam(required = false) BigDecimal maxFinalPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Integer minQuantity,
            @RequestParam(required = false) Integer maxQuantity) {

        return ResponseEntity.ok(receiptsService.getAllAdmin(
                externalId, userExtId, paymentMethod,
                minPrice, maxPrice,
                minFinalPrice, maxFinalPrice,
                from, to,
                minQuantity, maxQuantity));
    }

    @Operation(
            summary = "Buscar mis recibos",
            description = "Permite a un usuario autenticado buscar y filtrar sus propios recibos por múltiples criterios. El usuario se obtiene del token de autenticación."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de recibos obtenido correctamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReceiptResponseDTO.class)))),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de USER", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<ReceiptResponseDTO>> searchUser(
            @RequestParam(required = false) UUID externalId,
            @AuthenticationPrincipal(expression = "usuario.externalId") UUID userExtId,
            @RequestParam(required = false) String paymentMethod,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) BigDecimal minFinalPrice,
            @RequestParam(required = false) BigDecimal maxFinalPrice,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) Integer minQuantity,
            @RequestParam(required = false) Integer maxQuantity) {

        return ResponseEntity.ok(receiptsService.getAll(
                externalId, userExtId, paymentMethod,
                minPrice, maxPrice,
                minFinalPrice, maxFinalPrice,
                from, to,
                minQuantity, maxQuantity));
    }

    @Operation(
            summary = "Eliminar recibo",
            description = "Elimina un recibo de compra. Requiere rol ADMIN. El recibo solo puede eliminarse si su estado es RECHAZADA."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Recibo eliminado correctamente", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Recibo no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "No se puede eliminar: el recibo no está en estado RECHAZADA", content = @Content)
    })
    @DeleteMapping("/{receiptExtId}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<ReceiptResponseDTO> deleteReceipt(@PathVariable UUID receiptExtId){
        receiptsService.deleteReceipt(receiptExtId);
        return ResponseEntity.noContent().build();
    }

}
