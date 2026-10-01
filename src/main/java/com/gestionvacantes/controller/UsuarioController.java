package com.gestionvacantes.controller;

import com.gestionvacantes.dto.UsuarioRequest;
import com.gestionvacantes.dto.UsuarioResponse;
import com.gestionvacantes.service.UsuarioService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/reclutadores")
@Tag(name = "Reclutadores (Admin)", description = "CRUD de reclutadores gestionado por el Administrador")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Listar todos los reclutadores")
    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarReclutadores());
    }

    @Operation(summary = "Listar solo reclutadores activos")
    @GetMapping("/activos")
    public ResponseEntity<List<UsuarioResponse>> listarActivos() {
        return ResponseEntity.ok(usuarioService.listarReclutadoresActivos());
    }

    @Operation(summary = "Obtener un reclutador por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarPorId(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @Operation(summary = "Crear un nuevo reclutador")
    @PostMapping
    public ResponseEntity<UsuarioResponse> crear(
            @Valid @RequestBody UsuarioRequest request) {
        return new ResponseEntity<>(usuarioService.crearReclutador(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar un reclutador existente")
    @PutMapping("/{id}")
    public ResponseEntity<UsuarioResponse> actualizar(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long id,
            @Valid @RequestBody UsuarioRequest request) {
        return ResponseEntity.ok(usuarioService.actualizarReclutador(id, request));
    }

    @Operation(summary = "Deshabilitar un reclutador (soft delete)")
    @PatchMapping("/{id}/deshabilitar")
    public ResponseEntity<UsuarioResponse> deshabilitar(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.deshabilitarReclutador(id));
    }

    @Operation(summary = "Habilitar un reclutador")
    @PatchMapping("/{id}/habilitar")
    public ResponseEntity<UsuarioResponse> habilitar(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.habilitarReclutador(id));
    }

    @Operation(summary = "Eliminar un reclutador (hard delete)")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long id) {
        usuarioService.eliminarReclutador(id);
        return ResponseEntity.noContent().build();
    }
}