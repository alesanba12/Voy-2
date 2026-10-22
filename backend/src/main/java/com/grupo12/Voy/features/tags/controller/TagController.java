package com.grupo12.Voy.features.tags.controller;

import com.grupo12.Voy.features.tags.ITagService;
import com.grupo12.Voy.features.tags.dto.TagsDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@AllArgsConstructor
@RequestMapping("/api/tags")
public class TagController {
    private final ITagService tagService;

    @Operation(
            summary = "Listar etiquetas",
            description = "Devuelve todas las etiquetas, opcionalmente filtradas por nombre (búsqueda parcial)."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Listado de etiquetas obtenido correctamente",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = TagsDTO.class))))
    })
    @GetMapping
    ResponseEntity<List<TagsDTO>> findAll(@RequestParam(required = false) String name){
        return ResponseEntity.ok(tagService.findAll(name));
    }

    @Operation(
            summary = "Crear etiqueta",
            description = "Crea una nueva etiqueta. Requiere rol ADMIN."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Etiqueta creada correctamente",
                    content = @Content(schema = @Schema(implementation = TagsDTO.class))),
            @ApiResponse(responseCode = "400", description = "Datos inválidos en el cuerpo de la petición", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de ADMIN", content = @Content),
            @ApiResponse(responseCode = "409", description = "La etiqueta ya existe", content = @Content)
    })
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<TagsDTO> create(@RequestBody @Valid TagsDTO tagsDTO){
        tagService.save(tagsDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(tagsDTO);
    }

    @Operation(
            summary = "Actualizar etiqueta",
            description = "Actualiza el nombre de una etiqueta existente, identificada por su nombre actual. Requiere rol ADMIN."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Etiqueta actualizada correctamente", content = @Content),
            @ApiResponse(responseCode = "400", description = "Datos inválidos en el cuerpo de la petición", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Etiqueta no encontrada", content = @Content)
    })
    @PutMapping("/{oldName}")
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<TagsDTO> update(@PathVariable String oldName,@RequestBody @Valid TagsDTO tagsDTO){
        tagService.update(oldName,tagsDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @Operation(
            summary = "Eliminar etiqueta",
            description = "Elimina una etiqueta existente según el nombre enviado en el cuerpo. Requiere rol ADMIN."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Etiqueta eliminada correctamente", content = @Content),
            @ApiResponse(responseCode = "400", description = "Datos inválidos en el cuerpo de la petición", content = @Content),
            @ApiResponse(responseCode = "401", description = "No autenticado", content = @Content),
            @ApiResponse(responseCode = "403", description = "No tiene permisos de ADMIN", content = @Content),
            @ApiResponse(responseCode = "404", description = "Etiqueta no encontrada", content = @Content)
    })
    @DeleteMapping
    @PreAuthorize("hasRole('ADMIN')")
    ResponseEntity<TagsDTO> delete(@RequestBody @Valid TagsDTO tagsDTO){
        tagService.delete(tagsDTO);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
