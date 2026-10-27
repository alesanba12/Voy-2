package com.grupo12.Voy.features.organizers.service;

import com.grupo12.Voy.common.exceptions.AlreadyExistsException;
import com.grupo12.Voy.common.exceptions.EntityNotFoundException;
import com.grupo12.Voy.common.exceptions.InvalidFieldException;
import com.grupo12.Voy.features.organizers.dto.OrganizerRejectReqDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerificationResDTO;
import com.grupo12.Voy.features.organizers.dto.OrganizerVerifyReqDTO;
import com.grupo12.Voy.features.organizers.enums.VerificationStatus;
import com.grupo12.Voy.features.organizers.mapper.OrganizerVerificationMapper;
import com.grupo12.Voy.features.organizers.models.OrganizerVerificationEntity;
import com.grupo12.Voy.features.organizers.repository.OrganizerVerificationRepository;
import com.grupo12.Voy.features.users.UserRepository;
import com.grupo12.Voy.features.users.Service.IUsersService;
import com.grupo12.Voy.features.users.models.UserEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrganizerVerificationService implements IOrganizerVerificationService {

    private final OrganizerVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final IUsersService usersService;
    private final OrganizerVerificationMapper verificationMapper;

    @Override
    @Transactional
    public void requestVerification(UUID idExternal, OrganizerVerifyReqDTO reqDTO) {
        UserEntity user = userRepository.findByExternalId(idExternal)
                .orElseThrow(() -> new EntityNotFoundException("Usuario no encontrado con ID: " + idExternal));

        Optional<OrganizerVerificationEntity> verificationOpt = verificationRepository.findByUserExternalId(idExternal);

        if (verificationOpt.isPresent()) {
            VerificationStatus currentStatus = verificationOpt.get().getStatus();
            if (currentStatus == VerificationStatus.PENDING) {
                throw new AlreadyExistsException("Ya tienes una solicitud de verificación pendiente.");
            }
            if (currentStatus == VerificationStatus.VERIFIED) {
                throw new AlreadyExistsException("Tu cuenta ya está verificada como organizador.");
            }
        }

        // Subida de imágenes del DNI a Cloudinary en la carpeta "voy/dni"
        String frontUrl = cloudinaryService.uploadFile(reqDTO.dniFront(), "voy/dni");
        String backUrl = cloudinaryService.uploadFile(reqDTO.dniBack(), "voy/dni");

        OrganizerVerificationEntity verification = verificationOpt.orElseGet(() ->
                OrganizerVerificationEntity.builder()
                        .user(user)
                        .build()
        );

        verification.setDniFrontUrl(frontUrl);
        verification.setDniBackUrl(backUrl);
        verification.setAdditionalInfo(reqDTO.additionalInfo());
        verification.setStatus(VerificationStatus.PENDING);
        verification.setRejectionReason(null);

        verificationRepository.save(verification);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrganizerVerificationResDTO> getPendingVerifications() {
        return verificationRepository.findByStatus(VerificationStatus.PENDING)
                .stream()
                .map(verificationMapper::toDto)
                .toList();
    }

    @Override
    @Transactional
    public OrganizerVerificationResDTO approveVerification(UUID idExternal) {
        OrganizerVerificationEntity verification = verificationRepository.findByUserExternalId(idExternal)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró solicitud de verificación para el usuario: " + idExternal));

        if (verification.getStatus() != VerificationStatus.PENDING) {
            throw new InvalidFieldException("Solo se pueden aprobar solicitudes en estado PENDIENTE.");
        }

        verification.setStatus(VerificationStatus.VERIFIED);
        verification.setRejectionReason(null);


        usersService.promoteToOrganizer(idExternal);

        return verificationMapper.toDto(verificationRepository.save(verification));
    }

    @Override
    @Transactional
    public OrganizerVerificationResDTO rejectVerification(UUID idExternal, OrganizerRejectReqDTO rejectDTO) {
        OrganizerVerificationEntity verification = verificationRepository.findByUserExternalId(idExternal)
                .orElseThrow(() -> new EntityNotFoundException("No se encontró solicitud de verificación para el usuario: " + idExternal));

        if (verification.getStatus() != VerificationStatus.PENDING) {
            throw new InvalidFieldException("Solo se pueden rechazar solicitudes en estado PENDIENTE.");
        }

        verification.setStatus(VerificationStatus.REJECTED);
        verification.setRejectionReason(rejectDTO.reason());

        return verificationMapper.toDto(verificationRepository.save(verification));
    }

}