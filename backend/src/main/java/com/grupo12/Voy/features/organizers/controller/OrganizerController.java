package com.grupo12.Voy.features.organizers.controller;

import com.grupo12.Voy.features.organizers.dto.OrganizerVerifyReqDTO;
import com.grupo12.Voy.features.organizers.service.IOrganizerVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/organizers")
@RequiredArgsConstructor
@Tag(name = "Organizers", description = "Endpoints de verificación para usuarios que desean ser organizadores")
public class OrganizerController {

    private final IOrganizerVerificationService verificationService;

    @Operation(summary = "Enviar solicitud de verificación", description = "Suba foto de frente y dorso del DNI. Estado inicial: PENDIENTE.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Solicitud enviada exitosamente"),
            @ApiResponse(responseCode = "400", description = "Archivos inválidos o solicitud ya en curso"),
            @ApiResponse(responseCode = "403", description = "Acceso denegado")
    })
    @PostMapping(value = "/verify", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> requestVerification(
            @AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal,
            @Valid @ModelAttribute OrganizerVerifyReqDTO requestDTO) {
        verificationService.requestVerification(idExternal, requestDTO);
        return ResponseEntity.ok().build();
    }
}