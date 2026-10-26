package com.grupo12.Voy.features.organizers.service;

import com.grupo12.Voy.features.organizers.dto.OrganizerRejectReqDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerifyReqDTO;

import java.util.List;
import java.util.UUID;

public interface IOrganizerVerificationService {

    void requestVerification(UUID idExternal, OrganizerVerifyReqDTO reqDTO);

    List<OrganizerVerificationResDTO> getPendingVerifications();

    OrganizerVerificationResDTO approveVerification(UUID idExternal);

    OrganizerVerificationResDTO rejectVerification(UUID idExternal, OrganizerRejectReqDTO rejectDTO);
}