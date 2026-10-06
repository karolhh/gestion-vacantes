package com.gestionvacantes.controller;

import com.gestionvacantes.dto.PostulanteRequest;
import com.gestionvacantes.dto.UsuarioResponse;
import com.gestionvacantes.service.PostulanteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@Tag(name = "Postulantes", description = "Registro y perfil del postulante")
public class PostulanteController {

    private final PostulanteService postulanteService;

    public PostulanteController(PostulanteService postulanteService) {
        this.postulanteService = postulanteService;
    }

    // =====================================================
    // REGISTRO PÚBLICO
    // =====================================================
    @Operation(summary = "Registrar un nuevo postulante (público)")
    @PostMapping("/api/auth/register")
    public ResponseEntity<UsuarioResponse> registrar(
            @Valid @RequestBody PostulanteRequest request) {
        return new ResponseEntity<>(postulanteService.registrar(request), HttpStatus.CREATED);
    }

    // =====================================================
    // VER MI PERFIL
    // =====================================================
    @Operation(summary = "Ver mi perfil como postulante")
    @GetMapping("/api/postulantes/me")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> verPerfil(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        Long usuarioId = obtenerUsuarioIdDesdeEmail(email);
        return ResponseEntity.ok(postulanteService.verPerfil(usuarioId));
    }

    // =====================================================
    // EDITAR MI PERFIL
    // =====================================================
    @Operation(summary = "Editar mi perfil como postulante")
    @PutMapping("/api/postulantes/me")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> editarPerfil(
            Authentication authentication,
            @Valid @RequestBody PostulanteRequest request) {
        String email = (String) authentication.getPrincipal();
        Long usuarioId = obtenerUsuarioIdDesdeEmail(email);
        return ResponseEntity.ok(postulanteService.editarPerfil(usuarioId, request));
    }

    // =====================================================
    // SUBIR HOJA DE VIDA
    // =====================================================
    @Operation(summary = "Subir mi hoja de vida (PDF)")
    @PostMapping(value = "/api/postulantes/me/hoja-vida",
                 consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<UsuarioResponse> subirHojaDeVida(
            Authentication authentication,
            @RequestParam("archivo") MultipartFile archivo) {
        String email = (String) authentication.getPrincipal();
        Long usuarioId = obtenerUsuarioIdDesdeEmail(email);
        return ResponseEntity.ok(postulanteService.subirHojaDeVida(usuarioId, archivo));
    }

    // =====================================================
    // DESCARGAR HOJA DE VIDA
    // =====================================================
    @Operation(summary = "Descargar mi hoja de vida")
    @GetMapping("/api/postulantes/me/hoja-vida")
    @PreAuthorize("hasAnyRole('POSTULANTE', 'ADMIN')")
    public ResponseEntity<byte[]> descargarHojaDeVida(Authentication authentication) {
        String email = (String) authentication.getPrincipal();
        Long usuarioId = obtenerUsuarioIdDesdeEmail(email);

        byte[] contenido = postulanteService.descargarHojaDeVida(usuarioId);
        String nombre = postulanteService.obtenerNombreHojaDeVida(usuarioId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", nombre);

        return new ResponseEntity<>(contenido, headers, HttpStatus.OK);
    }

    // =====================================================
    // HELPER: obtener el ID del usuario desde su email
    // =====================================================
    private Long obtenerUsuarioIdDesdeEmail(String email) {
        // Se resuelve con el PostulanteService usando el email
        // Para no duplicar lógica, haremos una búsqueda adicional
        return postulanteService.verPerfilPorEmail(email).getId();
    }
}