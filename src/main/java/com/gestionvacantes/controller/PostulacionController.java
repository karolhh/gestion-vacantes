package com.gestionvacantes.controller;

import com.gestionvacantes.dto.PostulacionRequest;
import com.gestionvacantes.dto.PostulacionResponse;
import com.gestionvacantes.entity.Postulacion;
import com.gestionvacantes.service.PostulacionService;
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
@RequestMapping("/api/postulaciones")
@Tag(name = "Postulaciones", description = "Gestión de postulaciones a vacantes")
public class PostulacionController {

    private final PostulacionService postulacionService;

    public PostulacionController(PostulacionService postulacionService) {
        this.postulacionService = postulacionService;
    }

    // NUEVO ENDPOINT GLOBAL
    @Operation(summary = "Listar todas las postulaciones del sistema (Para Reclutadores/Admin)")
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'RECLUTADOR')")
    public ResponseEntity<List<PostulacionResponse>> listarTodas() {
        return ResponseEntity.ok(postulacionService.listarTodas());
    }

    @Operation(summary = "Postularse a una vacante")
    @PostMapping
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<PostulacionResponse> postularse(
            @Valid @RequestBody PostulacionRequest request) {
        return new ResponseEntity<>(postulacionService.postularse(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Listar mis postulaciones")
    @GetMapping("/mis-postulaciones/{postulanteId}")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<List<PostulacionResponse>> listarMisPostulaciones(
            @PathVariable Long postulanteId) {
        return ResponseEntity.ok(postulacionService.listarMisPostulaciones(postulanteId));
    }

    @Operation(summary = "Listar mis postulaciones por estado")
    @GetMapping("/mis-postulaciones/{postulanteId}/estado/{estado}")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<List<PostulacionResponse>> listarMisPostulacionesPorEstado(
            @PathVariable Long postulanteId, @PathVariable Postulacion.Estado estado) {
        return ResponseEntity.ok(postulacionService.listarMisPostulacionesPorEstado(postulanteId, estado));
    }

    @Operation(summary = "Obtener una postulación por su ID")
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'RECLUTADOR', 'ADMIN')")
    public ResponseEntity<PostulacionResponse> buscarPorId(@PathVariable Long id) {
        return ResponseEntity.ok(postulacionService.buscarPorId(id));
    }

    @Operation(summary = "Listar postulaciones de una vacante")
    @GetMapping("/vacante/{vacanteId}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<List<PostulacionResponse>> listarPorVacante(@PathVariable Long vacanteId) {
        return ResponseEntity.ok(postulacionService.listarPorVacante(vacanteId));
    }

    @Operation(summary = "Listar postulaciones de una vacante por estado")
    @GetMapping("/vacante/{vacanteId}/estado/{estado}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<List<PostulacionResponse>> listarPorVacanteYEstado(
            @PathVariable Long vacanteId, @PathVariable Postulacion.Estado estado) {
        return ResponseEntity.ok(postulacionService.listarPorVacanteYEstado(vacanteId, estado));
    }

    @Operation(summary = "Actualizar el estado de una postulación")
    @PatchMapping("/{id}/estado/{estado}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<PostulacionResponse> actualizarEstado(
            @PathVariable Long id, @PathVariable Postulacion.Estado estado) {
        return ResponseEntity.ok(postulacionService.actualizarEstado(id, estado));
    }

    @Operation(summary = "Eliminar una postulación")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        postulacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}