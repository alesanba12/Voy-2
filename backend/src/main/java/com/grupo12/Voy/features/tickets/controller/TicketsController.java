package com.grupo12.Voy.features.tickets.controller;

import com.grupo12.Voy.features.tickets.models.DTO.TicketAndReceiptDto;
import com.grupo12.Voy.features.tickets.models.DTO.TicketPrivateRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketRequestDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketResponseDTO;
import com.grupo12.Voy.features.tickets.service.ITicketsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@RestController
@RequestMapping("/api/tickets")
public class TicketsController {
    private final ITicketsService ticketsService;

    @Operation(summary = "Listar todos los tickets (Admin)", description = "Retorna todos los tickets del sistema con filtros opcionales. Requiere rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de tickets encontrados",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TicketResponseDTO.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ADMIN", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TicketResponseDTO>> getAllAdmin(@RequestParam(required = false) UUID externalId,
                                                          @RequestParam(required = false) Boolean isConfirmed,
                                                          @RequestParam(required = false) String title,
                                                          @RequestParam(required = false) String usernameOrganizer,
                                                          @RequestParam(required = false) String usernameUser
    ){
        return ResponseEntity.ok(ticketsService.getAllAdmin(externalId,isConfirmed,
                title,usernameOrganizer,usernameUser));
    }

    @Operation(summary = "Listar tickets de mis eventos (Organizador)", description = "Retorna los tickets de los eventos organizados por el usuario autenticado. El organizador se obtiene del token JWT. Requiere rol ORGANIZATOR.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de tickets encontrados",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TicketResponseDTO.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ORGANIZATOR", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/organizer")
    @PreAuthorize("hasRole('ORGANIZATOR')")
    public ResponseEntity<List<TicketResponseDTO>> getAllOrganizer(@RequestParam(required = false) UUID externalId,
                                                          @RequestParam(required = false) Boolean isConfirmed,
                                                          @RequestParam(required = false) String title,
                                                          @AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                                          @RequestParam(required = false) String usernameUser
    ){
        return ResponseEntity.ok(ticketsService.getAllOrganizer(externalId,isConfirmed,
                title,userExtId,usernameUser));
    }

    @Operation(summary = "Listar mis tickets (Usuario)", description = "Retorna los tickets del usuario autenticado. El ID se obtiene del token JWT. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de tickets del usuario",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TicketResponseDTO.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<List<TicketResponseDTO>> getAll(@RequestParam(required = false) UUID externalId,
                                                          @RequestParam(required = false) Boolean isConfirmed,
                                                          @RequestParam(required = false) String title,
                                                          @RequestParam(required = false) String usernameOrganizer,
                                                          @AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId
    ){
        return ResponseEntity.ok(ticketsService.getAllUser(externalId,isConfirmed,
                title,usernameOrganizer,userExtId));
    }

    @Operation(summary = "Comprar tickets (evento público)", description = "Realiza la compra de tickets para un evento público. La cantidad debe ser entre 1 y 5, y no puede superar los lugares disponibles. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Compra realizada exitosamente",
                    content = @Content(schema = @Schema(implementation = TicketAndReceiptDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario o evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "No hay suficientes lugares disponibles", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = TicketRequestDTO.class,
                    example = """
                            {
                              "paymentMethod": "CREDIT_CARD",
                              "quantity": 2,
                              "partyIdExternal": "123e4567-e89b-12d3-a456-426614174000"
                            }
                            """))
    )
    @PostMapping
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TicketAndReceiptDto> purchaseTicketsPublic(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
            @RequestBody @Valid TicketRequestDTO ticketDTO){
        return ResponseEntity.ok(ticketsService.purchaseTickets(userExtId,ticketDTO));
    }

    @Operation(summary = "Obtener tickets (evento privado)", description = "Registra la asistencia a un evento privado de forma gratuita. No puede superar los lugares disponibles. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Tickets obtenidos exitosamente",
                    content = @Content(schema = @Schema(implementation = TicketAndReceiptDto.class))),
            @ApiResponse(responseCode = "400", description = "Datos de la solicitud inválidos", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario o evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "409", description = "No hay suficientes lugares disponibles", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @io.swagger.v3.oas.annotations.parameters.RequestBody(
            required = true,
            content = @Content(schema = @Schema(implementation = TicketPrivateRequestDTO.class,
                    example = """
                            {
                              "quantity": 2,
                              "partyIdExternal": "123e4567-e89b-12d3-a456-426614174000"
                            }
                            """))
    )
    @PostMapping("/private")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<TicketAndReceiptDto> getTicketsPrivate(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                                                 @RequestBody @Valid TicketPrivateRequestDTO ticketDTO){
        return ResponseEntity.ok(ticketsService.getTicketsPrivate(userExtId,ticketDTO));
    }

    @Operation(summary = "Transferir ticket", description = "Transfiere un ticket del usuario autenticado a otro usuario. El ticket debe estar confirmado para poder transferirse. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ticket transferido exitosamente",
                    content = @Content(schema = @Schema(implementation = TicketResponseDTO.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol USER, o el usuario no es el propietario del ticket, o la compra aún está pendiente de aprobación", content = @Content),
            @ApiResponse(responseCode = "404", description = "Ticket o usuario destino no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PatchMapping("/transferTicket/{ticketId}")
    @PreAuthorize("hasRole('USER')")
    public  ResponseEntity<TicketResponseDTO> transferTicket(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                                             @PathVariable UUID ticketId,
                                                             @RequestParam UUID newUserExtId){
        return ResponseEntity.ok(ticketsService.transferTicket(ticketId,userExtId,newUserExtId));
    }

    @Operation(summary = "Confirmar compra (Admin)", description = "Confirma todos los tickets asociados a un recibo y los marca como aprobados. Requiere rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Compra confirmada exitosamente",
                    content = @Content(schema = @Schema(implementation = TicketAndReceiptDto.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Recibo no encontrado o sin tickets asociados", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PatchMapping("/confirmTickets/{receiptExtId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TicketAndReceiptDto> confirmPurchase(@PathVariable UUID receiptExtId){
        return ResponseEntity.ok(ticketsService.confirmPurchase(receiptExtId));
    }

    @Operation(summary = "Devolver ticket", description = "Permite al usuario autenticado devolver un ticket. Solo se pueden devolver tickets de eventos gratuitos. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Ticket devuelto exitosamente", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol USER, el usuario no es el propietario, o el ticket es de un evento pago", content = @Content),
            @ApiResponse(responseCode = "404", description = "Ticket no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @DeleteMapping("/returnTicket/{ticketId}")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<Void> returnTicket(@AuthenticationPrincipal(expression = "usuario.externalId")UUID userExtId,
                                             @PathVariable UUID ticketId){
        ticketsService.returnTicket(userExtId,ticketId);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Rechazar compra (Admin)", description = "Rechaza y elimina todos los tickets asociados a un recibo. Solo se puede rechazar si la compra está en estado PENDIENTE. Requiere rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Compra rechazada exitosamente", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado: se requiere rol ADMIN, o la compra ya fue aprobada o rechazada anteriormente", content = @Content),
            @ApiResponse(responseCode = "404", description = "Recibo no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @DeleteMapping("/rejectPurchase/{receiptId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> rejectPurchase(@PathVariable UUID receiptId){
        ticketsService.rejectPurchase(receiptId);
        return ResponseEntity.noContent().build();
    }
}
