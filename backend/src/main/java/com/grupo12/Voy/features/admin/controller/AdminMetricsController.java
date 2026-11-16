package com.grupo12.Voy.features.admin.controller;

import com.grupo12.Voy.features.admin.dto.AdminDashboardMetricsDTO;
import com.grupo12.Voy.features.admin.service.IAdminMetricsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/metrics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Metrics", description = "Indicadores y métricas consolidadas para el Dashboard Administrativo")
public class AdminMetricsController {

    private final IAdminMetricsService adminMetricsService;

    @Operation(
            summary = "Obtener métricas consolidadas del Dashboard",
            description = "Retorna en una sola llamada los KPIs del panel: solicitudes pendientes/aprobadas, " +
                    "usuarios registrados activos y eventos activos/totales. Requiere rol ADMIN."
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Métricas calculadas exitosamente",
                    content = @Content(schema = @Schema(implementation = AdminDashboardMetricsDTO.class))
            ),
            @ApiResponse(responseCode = "401", description = "No autenticado (Token JWT ausente o inválido)", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ADMIN", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    public ResponseEntity<AdminDashboardMetricsDTO> getDashboardMetrics() {
        return ResponseEntity.ok(adminMetricsService.getDashboardMetrics());
    }
}
