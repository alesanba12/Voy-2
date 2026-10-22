package com.grupo12.Voy.features.parties.controller;

import com.grupo12.Voy.features.parties.Dto.PartyReqDTO;
import com.grupo12.Voy.features.parties.Dto.PartyReqPrivateDto;
import com.grupo12.Voy.features.parties.Dto.PartyResDTO;
import com.grupo12.Voy.features.parties.service.IPartyService;
import com.grupo12.Voy.features.tags.dto.TagsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
@Tag(name = "Parties", description = "Gestión de eventos")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/parties")
public class PartiesController {

    private final IPartyService partyService;

    @Operation(summary = "Listar eventos", description = """
            Retorna una lista de eventos filtrados por los parámetros opcionales.
            Los eventos privados solo son visibles para su organizador o un ADMIN.
            El ID del usuario autenticado se obtiene del token JWT para aplicar el filtro de visibilidad.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de eventos encontrados",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PartyResDTO.class)))),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    public ResponseEntity<List<PartyResDTO>> findAll(
            @RequestParam(required = false) UUID partyId,
            @RequestParam(required = false) UUID organizerId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String city
    ) {
        return ResponseEntity.ok(partyService.getAll(partyId, organizerId, title, city));
    }

    @Operation(summary = "Obtener evento por ID", description = """
            Retorna un evento por su ID externo.
            Si el evento es privado, solo el organizador o un ADMIN pueden verlo.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Evento encontrado",
                    content = @Content(schema = @Schema(implementation = PartyResDTO.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. El evento es privado y el usuario no tiene permisos para verlo", content = @Content),
            @ApiResponse(responseCode = "404", description = "Evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/{id}")
    public ResponseEntity<PartyResDTO> findById(
            @PathVariable UUID id,
            @AuthenticationPrincipal(expression = "usuario.externalId") UUID currentUserId
    ) {
        return ResponseEntity.ok(partyService.getById(id, currentUserId));
    }

    @Operation(summary = "Crear evento público (Organizador)", description = """
            Crea un nuevo evento público con precio. El organizador se obtiene del token JWT.
            Lanza error si ya existe un evento con el mismo título. Requiere rol ORGANIZATOR.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Evento público creado exitosamente",
                    content = @Content(schema = @Schema(implementation = PartyResDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ORGANIZATOR", content = @Content),
            @ApiResponse(responseCode = "404", description = "Organizador no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Ya existe un evento con ese título", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = PartyReqDTO.class,
                    example = """
                            {
                              "title": "Fiesta de verano",
                              "description": "Una gran fiesta al aire libre",
                              "city": "Mar del Plata",
                              "adress": "Av. Colón 1234",
                              "dateTime": "2025-12-31T22:00:00",
                              "guestLimit": 100,
                              "partyAccesibility": true,
                              "price": 2000.00
                            }
                            """))
    )
    @PostMapping("/public")
    @PreAuthorize("hasRole('ORGANIZATOR')")
    public ResponseEntity<PartyResDTO> createPublic(@RequestBody @Valid PartyReqDTO party,
                                                    @AuthenticationPrincipal(expression = "usuario.externalId") UUID currentUserId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partyService.createPublic(party,currentUserId));
    }


    @Operation(summary = "Crear evento privado (Usuario)", description = """
            Crea un nuevo evento privado y gratuito. El organizador se obtiene del token JWT.
            El precio se establece automáticamente en 0 y la accesibilidad en privado.
            Lanza error si ya existe un evento con el mismo título. Requiere rol USER.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Evento privado creado exitosamente",
                    content = @Content(schema = @Schema(implementation = PartyResDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Organizador no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "Ya existe un evento con ese título", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = PartyReqPrivateDto.class,
                    example = """
                            {
                              "title": "Reunión privada",
                              "description": "Encuentro entre amigos",
                              "city": "Mar del Plata",
                              "adress": "Calle Falsa 123",
                              "dateTime": "2025-11-15T20:00:00",
                              "guestLimit": 20
                            }
                            """))
    )
    @PostMapping("/private")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<PartyResDTO> createPrivate(@RequestBody @Valid PartyReqPrivateDto party,
                                                     @AuthenticationPrincipal(expression = "usuario.externalId") UUID currentUserId) {
        return ResponseEntity.status(HttpStatus.CREATED).body(partyService.createPrivate(party,currentUserId));
    }

    @Operation(summary = "Actualizar evento", description = """
            Actualiza los datos de un evento existente.
            Si el evento es privado, el precio se mantiene en 0 independientemente del valor enviado.
            Requiere rol ORGANIZATOR o USER.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Evento actualizado exitosamente",
                    content = @Content(schema = @Schema(implementation = PartyResDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ORGANIZATOR o USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = PartyReqDTO.class,
                    example = """
                            {
                              "title": "Fiesta de verano actualizada",
                              "description": "Descripción actualizada",
                              "city": "Mar del Plata",
                              "adress": "Av. Colón 5678",
                              "dateTime": "2025-12-31T23:00:00",
                              "guestLimit": 150,
                              "partyAccesibility": true,
                              "price": 2500.00
                            }
                            """))
    )
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATOR') or hasRole('USER')")
    public ResponseEntity<PartyResDTO> update(@PathVariable UUID id, @RequestBody @Valid PartyReqDTO party) {
        return ResponseEntity.ok(partyService.update(id, party));
    }

    @Operation(summary = "Agregar etiqueta a evento", description = """
            Asocia una etiqueta existente a un evento.
            Lanza error si la etiqueta ya está asignada al evento.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Etiqueta agregada exitosamente",
                    content = @Content(schema = @Schema(implementation = PartyResDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "404", description = "Evento o etiqueta no encontrada", content = @Content),
            @ApiResponse(responseCode = "409", description = "La etiqueta ya está asignada al evento", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = TagsDTO.class,
                    example = """
                            {
                              "name": "electrónica"
                            }
                            """))
    )
    @PostMapping("/{id}/tag")
    public ResponseEntity<PartyResDTO> addTag(@PathVariable UUID id, @RequestBody @Valid TagsDTO tagsDTO) {
        return ResponseEntity.ok(partyService.addTag(id, tagsDTO));
    }

    @Operation(summary = "Eliminar etiqueta de evento", description = """
            Elimina una etiqueta asignada a un evento.
            Si la etiqueta no está asignada al evento se retorna 404.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Etiqueta eliminada exitosamente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Evento o etiqueta no encontrada", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = TagsDTO.class,
                    example = """
                            {
                              "name": "electrónica"
                            }
                            """))
    )
    @DeleteMapping("/{id}/tag")
    public ResponseEntity<Void> removeTag(@PathVariable UUID id, @RequestBody @Valid TagsDTO tagsDTO) {
        partyService.removeTag(id, tagsDTO);
        return ResponseEntity.noContent().build();
    }
    @Operation(summary = "Eliminar evento", description = """
            Realiza un borrado lógico del evento (no se elimina físicamente de la base de datos).
            Requiere rol ORGANIZATOR o ADMIN.
            """)
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Evento eliminado exitosamente", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ORGANIZATOR o ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ORGANIZATOR') or hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        partyService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/coOrganizers")
    public ResponseEntity<PartyResDTO> addCoOrganizer(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                                      @PathVariable UUID id, @RequestParam UUID otherUserExtId) {
        return ResponseEntity.ok(partyService.addCoOrganizrer(userExtId, id, otherUserExtId));
    }

    @DeleteMapping("/{id}/coOrganizers")
    public ResponseEntity<PartyResDTO> removeCoOrganizer(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                                         @PathVariable UUID id, @RequestParam UUID otherUserExtId) {
        return ResponseEntity.ok(partyService.removeCoOrganizrer(userExtId, id, otherUserExtId));
    }
}
