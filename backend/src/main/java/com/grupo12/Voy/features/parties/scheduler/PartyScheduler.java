package com.grupo12.Voy.features.parties.scheduler;

import com.grupo12.Voy.features.parties.models.PartyEntity;
import com.grupo12.Voy.features.parties.repository.PartyRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class PartyScheduler {

    private final PartyRepository partyRepository;

    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void closeExpiredParties() {
        List<PartyEntity> expired = partyRepository
                .findByDateTimeBeforeAndLogicStateTrue(LocalDateTime.now());

        expired.forEach(party -> party.setLogicState(false));

        if (expired.isEmpty()) {
            log.info("[PartyScheduler] No hay eventos vencidos para cerrar.");
        } else {
            log.info("[PartyScheduler] Se cerraron {} evento(s) vencido(s).", expired.size());
        }
    }
}