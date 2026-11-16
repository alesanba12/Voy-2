package com.grupo12.Voy.features.admin.controller;

import com.grupo12.Voy.features.admin.dto.AdminDashboardMetricsDTO;
import com.grupo12.Voy.features.admin.service.IAdminMetricsService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMetricsControllerTest {

    @Mock
    private IAdminMetricsService adminMetricsService;

    @InjectMocks
    private AdminMetricsController adminMetricsController;

    @Test
    @DisplayName("getDashboardMetrics debe retornar 200 OK con el DTO de métricas del servicio")
    void getDashboardMetrics_shouldReturn200WithMetricsDTO() {
        // Arrange
        AdminDashboardMetricsDTO mockMetrics = new AdminDashboardMetricsDTO(
                10L, 25L, 500L, 40L, 120L
        );
        when(adminMetricsService.getDashboardMetrics()).thenReturn(mockMetrics);

        // Act
        ResponseEntity<AdminDashboardMetricsDTO> response = adminMetricsController.getDashboardMetrics();

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().pendingOrganizerRequests()).isEqualTo(10L);
        assertThat(response.getBody().approvedOrganizerRequests()).isEqualTo(25L);
        assertThat(response.getBody().totalUsers()).isEqualTo(500L);
        assertThat(response.getBody().activeParties()).isEqualTo(40L);
        assertThat(response.getBody().totalParties()).isEqualTo(120L);

        verify(adminMetricsService).getDashboardMetrics();
    }
}
