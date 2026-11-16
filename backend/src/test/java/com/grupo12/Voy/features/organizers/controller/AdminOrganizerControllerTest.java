package com.grupo12.Voy.features.organizers.controller;

import com.grupo12.Voy.features.organizers.dto.OrganizerRejectReqDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.service.IOrganizerVerificationService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminOrganizerControllerTest {

    @Mock
    private IOrganizerVerificationService verificationService;

    @InjectMocks
    private AdminOrganizerController adminOrganizerController;

    private OrganizerVerificationResDTO createSampleResDTO(UUID idExternal, VerificationStatus status) {
        return new OrganizerVerificationResDTO(
                idExternal,
                UUID.randomUUID(),
                "juanperez",
                "juan@voy.app",
                status,
                "https://cloudinary.com/front.jpg",
                "https://cloudinary.com/back.jpg",
                "Info adicional",
                null,
                LocalDateTime.now(),
                LocalDateTime.now()
        );
    }

    @Test
    @DisplayName("getPendingVerifications debe retornar 200 OK con la lista de solicitudes pendientes")
    void getPendingVerifications_shouldReturnList() {
        // Arrange
        UUID id = UUID.randomUUID();
        OrganizerVerificationResDTO dto = createSampleResDTO(id, VerificationStatus.PENDING);
        when(verificationService.getPendingVerifications()).willReturn(List.of(dto));

        // Act
        ResponseEntity<List<OrganizerVerificationResDTO>> response = adminOrganizerController.getPendingVerifications();

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull().hasSize(1);
        assertThat(response.getBody().getFirst().status()).isEqualTo(VerificationStatus.PENDING);
        verify(verificationService).getPendingVerifications();
    }

    @Test
    @DisplayName("approveVerification debe retornar 200 OK con la solicitud aprobada")
    void approveVerification_shouldReturnApprovedDTO() {
        // Arrange
        UUID id = UUID.randomUUID();
        OrganizerVerificationResDTO approvedDto = createSampleResDTO(id, VerificationStatus.VERIFIED);
        when(verificationService.approveVerification(id)).willReturn(approvedDto);

        // Act
        ResponseEntity<OrganizerVerificationResDTO> response = adminOrganizerController.approveVerification(id);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(VerificationStatus.VERIFIED);
        verify(verificationService).approveVerification(id);
    }

    @Test
    @DisplayName("rejectVerification debe retornar 200 OK con la solicitud rechazada y motivo")
    void rejectVerification_shouldReturnRejectedDTO() {
        // Arrange
        UUID id = UUID.randomUUID();
        OrganizerRejectReqDTO rejectReq = new OrganizerRejectReqDTO("DNI borroso o ilegible");
        OrganizerVerificationResDTO rejectedDto = new OrganizerVerificationResDTO(
                id,
                UUID.randomUUID(),
                "juanperez",
                "juan@voy.app",
                VerificationStatus.REJECTED,
                "https://cloudinary.com/front.jpg",
                "https://cloudinary.com/back.jpg",
                "Info adicional",
                "DNI borroso o ilegible",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(verificationService.rejectVerification(id, rejectReq)).willReturn(rejectedDto);

        // Act
        ResponseEntity<OrganizerVerificationResDTO> response = adminOrganizerController.rejectVerification(id, rejectReq);

        // Assert
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().status()).isEqualTo(VerificationStatus.REJECTED);
        assertThat(response.getBody().rejectionReason()).isEqualTo("DNI borroso o ilegible");
        verify(verificationService).rejectVerification(id, rejectReq);
    }
}
