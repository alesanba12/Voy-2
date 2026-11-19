package com.grupo12.Voy.features.organizers.service;

import com.grupo12.Voy.features.organizers.dto.OrganizerRejectReqDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationStatusResDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerifyReqDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IOrganizerVerificationService {

    void requestVerification(UUID idExternal, OrganizerVerifyReqDTO reqDTO);

    List<OrganizerVerificationResDTO> getPendingVerifications();

    Page<OrganizerVerificationResDTO> getVerifications(VerificationStatus status, Pageable pageable);

    OrganizerVerificationStatusResDTO getVerificationStatus(UUID idExternal);

    OrganizerVerificationResDTO approveVerification(UUID idExternal);

    OrganizerVerificationResDTO rejectVerification(UUID idExternal, OrganizerRejectReqDTO rejectDTO);
}