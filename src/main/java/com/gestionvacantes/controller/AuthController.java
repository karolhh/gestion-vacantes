package com.gestionvacantes.controller;

import com.gestionvacantes.dto.AuthResponse;
import com.gestionvacantes.dto.LoginRequest;
import com.gestionvacantes.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.entity.Usuario;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Autenticación", description = "Endpoints para login y autenticación")
public class AuthController {

    private final AuthService authService;
    private final UsuarioDao usuarioDao;

    public AuthController(AuthService authService, UsuarioDao usuarioDao) {
        this.authService = authService;
        this.usuarioDao = usuarioDao;
    }

    @Operation(summary = "Iniciar sesión y obtener token JWT")
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    // NUEVO ENDPOINT: Devuelve el ID del usuario logueado a través del token
    @Operation(summary = "Obtener el ID del usuario autenticado")
    @GetMapping("/me")
    public ResponseEntity<?> getMiId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Usuario usuario = usuarioDao.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        return ResponseEntity.ok(usuario.getId());
    }
}