package com.grupo12.Voy.features.admin.service;

import com.grupo12.Voy.features.admin.dto.AdminDashboardMetricsDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.repository.OrganizerVerificationRepository;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import com.grupo12.Voy.features.users.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminMetricsService implements IAdminMetricsService {

    private final OrganizerVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final PartyRepository partyRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardMetricsDTO getDashboardMetrics() {
        long pendingVerifications = verificationRepository.countByStatus(VerificationStatus.PENDING);
        long approvedVerifications = verificationRepository.countByStatus(VerificationStatus.VERIFIED);
        long activeUsers = userRepository.countActiveUsers();
        long activeParties = partyRepository.countActiveParties();
        long totalParties = partyRepository.count();

        return new AdminDashboardMetricsDTO(
                pendingVerifications,
                approvedVerifications,
                activeUsers,
                activeParties,
                totalParties
        );
    }
}
