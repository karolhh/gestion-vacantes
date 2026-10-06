package com.gestionvacantes.controller;

import com.gestionvacantes.dto.VacanteRequest;
import com.gestionvacantes.dto.VacanteResponse;
import com.gestionvacantes.entity.Vacante;
import com.gestionvacantes.service.VacanteService;
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
@RequestMapping("/api/vacantes")
@Tag(name = "Vacantes", description = "CRUD de vacantes gestionado por Reclutadores y consultado por Postulantes/Visitantes")
public class VacanteController {

    private final VacanteService vacanteService;

    public VacanteController(VacanteService vacanteService) {
        this.vacanteService = vacanteService;
    }

    // =====================================================
    // LECTURA PÚBLICA / AUTENTICADA
    // =====================================================

    @Operation(summary = "Listar todas las vacantes")
    @GetMapping
    public ResponseEntity<List<VacanteResponse>> listarTodas() {
        return ResponseEntity.ok(vacanteService.listarTodas());
    }

    @Operation(summary = "Listar vacantes por estado")
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<VacanteResponse>> listarPorEstado(
            @Parameter(description = "Estado de la vacante (ABIERTA, EN_PROCESO, CERRADA)")
            @PathVariable Vacante.Estado estado) {
        return ResponseEntity.ok(vacanteService.listarPorEstado(estado));
    }

    @Operation(summary = "Obtener una vacante por su ID")
    @GetMapping("/{id}")
    public ResponseEntity<VacanteResponse> buscarPorId(
            @Parameter(description = "ID de la vacante")
            @PathVariable Long id) {
        return ResponseEntity.ok(vacanteService.buscarPorId(id));
    }

    @Operation(summary = "Buscar vacantes por título")
    @GetMapping("/buscar/titulo")
    public ResponseEntity<List<VacanteResponse>> buscarPorTitulo(
            @RequestParam String titulo) {
        return ResponseEntity.ok(vacanteService.buscarPorTitulo(titulo));
    }

    @Operation(summary = "Buscar vacantes por ubicación")
    @GetMapping("/buscar/ubicacion")
    public ResponseEntity<List<VacanteResponse>> buscarPorUbicacion(
            @RequestParam String ubicacion) {
        return ResponseEntity.ok(vacanteService.buscarPorUbicacion(ubicacion));
    }

    @Operation(summary = "Buscar vacantes por título y ubicación")
    @GetMapping("/buscar")
    public ResponseEntity<List<VacanteResponse>> buscarPorTituloYUbicacion(
            @RequestParam String titulo,
            @RequestParam String ubicacion) {
        return ResponseEntity.ok(vacanteService.buscarPorTituloYUbicacion(titulo, ubicacion));
    }

    // =====================================================
    // LECTURA POR RECLUTADOR
    // =====================================================

    @Operation(summary = "Listar vacantes de un reclutador")
    @GetMapping("/reclutador/{reclutadorId}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<List<VacanteResponse>> listarPorReclutador(
            @Parameter(description = "ID del reclutador")
            @PathVariable Long reclutadorId) {
        return ResponseEntity.ok(vacanteService.listarPorReclutador(reclutadorId));
    }

    @Operation(summary = "Listar vacantes de un reclutador por estado")
    @GetMapping("/reclutador/{reclutadorId}/estado/{estado}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<List<VacanteResponse>> listarPorReclutadorYEstado(
            @PathVariable Long reclutadorId,
            @PathVariable Vacante.Estado estado) {
        return ResponseEntity.ok(vacanteService.listarPorReclutadorYEstado(reclutadorId, estado));
    }

    // =====================================================
    // ESCRITURA (SOLO RECLUTADOR / ADMIN)
    // =====================================================

    @Operation(summary = "Crear una nueva vacante")
    @PostMapping
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<VacanteResponse> crear(
            @Valid @RequestBody VacanteRequest request) {
        return new ResponseEntity<>(vacanteService.crear(request), HttpStatus.CREATED);
    }

    @Operation(summary = "Actualizar una vacante existente")
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<VacanteResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody VacanteRequest request) {
        return ResponseEntity.ok(vacanteService.actualizar(id, request));
    }

    @Operation(summary = "Cerrar una vacante")
    @PatchMapping("/{id}/cerrar")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<VacanteResponse> cerrar(
            @PathVariable Long id) {
        return ResponseEntity.ok(vacanteService.cerrar(id));
    }

    @Operation(summary = "Eliminar una vacante")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('RECLUTADOR', 'ADMIN')")
    public ResponseEntity<Void> eliminar(
            @PathVariable Long id) {
        vacanteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}