package com.grupo12.Voy.features.organizers.dto;

import com.grupo12.Voy.features.organizers.enums.VerificationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record OrganizerVerificationResDTO(
        Long id,
        UUID userExternalId,
        String userEmail,
        VerificationStatus status,
        String dniFrontUrl,
        String dniBackUrl,
        String additionalInfo,
        String rejectionReason,
        LocalDateTime createdAt
) {
}