package com.grupo12.Voy.features.users.Controller;


import com.grupo12.Voy.features.parties.Dto.PartyUsersDto;
import com.grupo12.Voy.features.receipts.DTO.ReceiptResponseDTO;
import com.grupo12.Voy.features.tickets.models.DTO.TicketUsersDto;
import com.grupo12.Voy.features.users.Dto.NewUserDto;
import com.grupo12.Voy.features.users.Dto.UserDto;
import com.grupo12.Voy.features.users.Dto.UserFollowDto;
import com.grupo12.Voy.features.users.Dto.UserUpdateDto;
import com.grupo12.Voy.features.users.Service.IUsersService;
import com.grupo12.Voy.features.users.models.UserEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final IUsersService userService;

    @Operation(summary = "Listar usuarios", description = "Retorna todos los usuarios. Se puede filtrar opcionalmente por username o email. Requiere rol USER.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios encontrados",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<UserDto>> getAll(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email
    ){
        return ResponseEntity.ok(userService.getAll(username,email));
    }

    @Operation(summary = "Eliminar usuario (Admin)", description = "Elimina cualquier usuario por su ID externo. Requiere rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Usuario eliminado exitosamente", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<Void> deleteUserByAdmin(@PathVariable UUID id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @Operation(summary = "Eliminar cuenta propia", description = "El usuario autenticado elimina su propia cuenta. El ID se obtiene del token JWT.")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Cuenta eliminada exitosamente", content = @Content),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @DeleteMapping
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<Void> deleteUser(@AuthenticationPrincipal(expression = "usuario.externalId") UUID id){
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/update")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<UserDto> updateUser(@AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal,
                                             @RequestBody @Valid UserUpdateDto userUpdateDto){
        return ResponseEntity.ok(userService.updateUser(idExternal, userUpdateDto));
    }

    @Operation(summary = "Listar usuarios seguidos", description = "Retorna la lista de usuarios que sigue el usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de usuarios seguidos",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserFollowDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/follows")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<UserFollowDto>> listFollowList(@AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal){
        return ResponseEntity.ok(userService.listFollowList(idExternal));
    }

    @Operation(summary = "Seguir / dejar de seguir usuario", description = "Alterna el estado de seguimiento entre el usuario autenticado y otro usuario.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de seguidos actualizada",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserFollowDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PatchMapping("/follow/user/{idOtherUser}")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<UserFollowDto>> alterFollowUser(@AuthenticationPrincipal(expression = "usuario.externalId")UUID idUser,
                                                        @PathVariable UUID idOtherUser){
        return ResponseEntity.ok(userService.alterFollow(idUser,idOtherUser));
    }

    @Operation(summary = "Listar seguidores", description = "Retorna la lista de usuarios que siguen al usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de seguidores",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = UserFollowDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/followers")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<UserFollowDto>> listFollowersList(@AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal){
       return ResponseEntity.ok(userService.listFollowersList(idExternal));
    }

    @Operation(summary = "Listar mis eventos", description = "Retorna la lista de eventos creados por el usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de eventos del usuario",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PartyUsersDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/myParties")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<PartyUsersDto>> listMyParties(@AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal){
        return ResponseEntity.ok(userService.listMyParties(idExternal));
    }

    @Operation(summary = "Listar eventos seguidos", description = "Retorna la lista de eventos que sigue el usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de eventos seguidos",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PartyUsersDto.class)))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol USER", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/followParties")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<PartyUsersDto>> listFollowedParties(@AuthenticationPrincipal(expression = "usuario.externalId") UUID idExternal){
        return ResponseEntity.ok((userService.listFollowedParties(idExternal)));
    }

    @Operation(summary = "Seguir / dejar de seguir evento", description = "Alterna el estado de seguimiento de un evento para el usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de eventos seguidos actualizada",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = PartyUsersDto.class)))),
            @ApiResponse(responseCode = "404", description = "Usuario o evento no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PatchMapping("/follow/party/{idParty}")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<PartyUsersDto>> alterFollowParty(@AuthenticationPrincipal(expression = "usuario.externalId")UUID idExternal,
                                                         @PathVariable UUID idParty){
        return ResponseEntity.ok(userService.alterFollowParty(idExternal,idParty));
    }

    @Operation(summary = "Listar mis tickets", description = "Retorna la lista de tickets del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de tickets del usuario",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TicketUsersDto.class)))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/myTickets")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<TicketUsersDto>> listMyTickets(@AuthenticationPrincipal(expression = "usuario.externalId")UUID idExternal){
        return ResponseEntity.ok((userService.listTickets(idExternal)));
    }

    @Operation(summary = "Listar mis recibos", description = "Retorna la lista de recibos del usuario autenticado.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de recibos del usuario",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = ReceiptResponseDTO.class)))),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @GetMapping("/myReceipts")
    @PreAuthorize("hasRole('USER')")
    ResponseEntity<List<ReceiptResponseDTO>> listMyReceipts(@AuthenticationPrincipal(expression = "usuario.externalId")UUID idExternal){
        return ResponseEntity.ok((userService.listReceipt(idExternal)));
    }

    @Operation(summary = "Verificar usuario (Admin)", description = "Promueve un usuario al rol ORGANIZATOR y lo marca como público. Requiere rol ADMIN.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuario verificado exitosamente",
                    content = @Content(schema = @Schema(implementation = UserDto.class))),
            @ApiResponse(responseCode = "403", description = "Acceso denegado. Se requiere rol ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Usuario no encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Error interno del servidor", content = @Content)
    })
    @PatchMapping("/verify/{idExternal}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UserDto> verifyUser(@PathVariable UUID idExternal){
        return ResponseEntity.ok(userService.userToPublic(idExternal));
    }
}
