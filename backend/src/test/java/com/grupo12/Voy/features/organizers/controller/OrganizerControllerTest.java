package com.grupo12.Voy.features.organizers.controller;

import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationStatusResDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.service.IOrganizerVerificationService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class OrganizerControllerTest {

    @Mock
    private IOrganizerVerificationService verificationService;

    @InjectMocks
    private OrganizerController organizerController;

    @Test
    void getMyVerificationStatus_shouldReturnCurrentUserStatus() {
        UUID userExternalId = UUID.randomUUID();
        OrganizerVerificationStatusResDTO status = new OrganizerVerificationStatusResDTO(
                VerificationStatus.REJECTED,
                "Documentación ilegible",
                LocalDateTime.now(),
                LocalDateTime.now()
        );
        when(verificationService.getVerificationStatus(userExternalId)).thenReturn(status);

        ResponseEntity<OrganizerVerificationStatusResDTO> response =
                organizerController.getMyVerificationStatus(userExternalId);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isEqualTo(status);
        verify(verificationService).getVerificationStatus(userExternalId);
    }
}
