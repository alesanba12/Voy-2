package com.grupo12.Voy.features.organizers.controller;

import com.grupo12.Voy.features.organizers.dto.OrganizerRejectReqDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.service.IOrganizerVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/organizers")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Organizers", description = "Panel de administración para revisar y responder solicitudes de verificación")
public class AdminOrganizerController {

    private final IOrganizerVerificationService verificationService;

    @Operation(summary = "Listar solicitudes de verificación pendientes")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de solicitudes pendientes devuelta"),
            @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN")
    })
    @GetMapping("/pending")
    public ResponseEntity<List<OrganizerVerificationResDTO>> getPendingVerifications() {
        return ResponseEntity.ok(verificationService.getPendingVerifications());
    }

    @Operation(summary = "Aprobar verificación", description = "Cambia el estado a VERIFIED y promueve accesibilityUser = true.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud aprobada exitosamente"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @PatchMapping("/{idExternal}/approve")
    public ResponseEntity<OrganizerVerificationResDTO> approveVerification(@PathVariable UUID idExternal) {
        return ResponseEntity.ok(verificationService.approveVerification(idExternal));
    }

    @Operation(summary = "Rechazar verificación", description = "Cambia el estado a REJECTED guardando el motivo.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud rechazada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Motivo de rechazo en blanco"),
            @ApiResponse(responseCode = "404", description = "Solicitud no encontrada")
    })
    @PatchMapping("/{idExternal}/reject")
    public ResponseEntity<OrganizerVerificationResDTO> rejectVerification(
            @PathVariable UUID idExternal,
            @Valid @RequestBody OrganizerRejectReqDTO rejectDTO) {
        return ResponseEntity.ok(verificationService.rejectVerification(idExternal, rejectDTO));
    }
}