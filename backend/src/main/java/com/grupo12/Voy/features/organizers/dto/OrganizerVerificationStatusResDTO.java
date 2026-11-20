package com.grupo12.Voy.features.organizers.dto;

import com.grupo12.Voy.features.organizers.enums.VerificationStatus;

import java.time.LocalDateTime;

public record OrganizerVerificationStatusResDTO(
        VerificationStatus status,
        String rejectionReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
