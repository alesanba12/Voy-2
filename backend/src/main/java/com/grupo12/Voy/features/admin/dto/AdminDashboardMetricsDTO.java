package com.grupo12.Voy.features.admin.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Métricas agregadas consolidadas para el Dashboard de Administración")
public record AdminDashboardMetricsDTO(

        @Schema(description = "Cantidad de solicitudes de organizador pendientes de revisión", example = "14")
        Long pendingOrganizerRequests,

        @Schema(description = "Cantidad de solicitudes de organizador verificadas/aprobadas", example = "58")
        Long approvedOrganizerRequests,

        @Schema(description = "Total de usuarios registrados activos (cuentas habilitadas)", example = "1240")
        Long totalUsers,

        @Schema(description = "Cantidad de eventos activos actualmente (no cancelados y no finalizados)", example = "85")
        Long activeParties,

        @Schema(description = "Cantidad histórica total de eventos registrados", example = "320")
        Long totalParties
) {
}
