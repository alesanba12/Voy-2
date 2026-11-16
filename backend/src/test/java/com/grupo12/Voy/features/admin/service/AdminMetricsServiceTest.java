package com.grupo12.Voy.features.admin.service;

import com.grupo12.Voy.features.admin.dto.AdminDashboardMetricsDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.repository.OrganizerVerificationRepository;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.users.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminMetricsServiceTest {

    @Mock
    private OrganizerVerificationRepository verificationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PartyRepository partyRepository;

    @InjectMocks
    private AdminMetricsService adminMetricsService;

    @Test
    @DisplayName("getDashboardMetrics debe retornar las 5 métricas consolidadas correctamente")
    void getDashboardMetrics_shouldReturnAllFiveMetrics() {
        // Arrange
        when(verificationRepository.countByStatus(VerificationStatus.PENDING)).thenReturn(14L);
        when(verificationRepository.countByStatus(VerificationStatus.VERIFIED)).thenReturn(58L);
        when(userRepository.countActiveUsers()).thenReturn(1240L);
        when(partyRepository.countActiveParties()).thenReturn(85L);
        when(partyRepository.count()).thenReturn(320L);

        // Act
        AdminDashboardMetricsDTO result = adminMetricsService.getDashboardMetrics();

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.pendingOrganizerRequests()).isEqualTo(14L);
        assertThat(result.approvedOrganizerRequests()).isEqualTo(58L);
        assertThat(result.totalUsers()).isEqualTo(1240L);
        assertThat(result.activeParties()).isEqualTo(85L);
        assertThat(result.totalParties()).isEqualTo(320L);

        // Verify interactions
        verify(verificationRepository).countByStatus(VerificationStatus.PENDING);
        verify(verificationRepository).countByStatus(VerificationStatus.VERIFIED);
        verify(userRepository).countActiveUsers();
        verify(partyRepository).countActiveParties();
        verify(partyRepository).count();
    }

    @Test
    @DisplayName("getDashboardMetrics con base de datos vacía retorna ceros en todas las métricas")
    void getDashboardMetrics_withEmptyDatabase_shouldReturnZeros() {
        // Arrange
        when(verificationRepository.countByStatus(VerificationStatus.PENDING)).thenReturn(0L);
        when(verificationRepository.countByStatus(VerificationStatus.VERIFIED)).thenReturn(0L);
        when(userRepository.countActiveUsers()).thenReturn(0L);
        when(partyRepository.countActiveParties()).thenReturn(0L);
        when(partyRepository.count()).thenReturn(0L);

        // Act
        AdminDashboardMetricsDTO result = adminMetricsService.getDashboardMetrics();

        // Assert
        assertThat(result.pendingOrganizerRequests()).isZero();
        assertThat(result.approvedOrganizerRequests()).isZero();
        assertThat(result.totalUsers()).isZero();
        assertThat(result.activeParties()).isZero();
        assertThat(result.totalParties()).isZero();
    }
}
