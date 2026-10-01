package com.gestionvacantes.service;

import com.gestionvacantes.dao.UsuarioDao;
import com.gestionvacantes.dto.AuthResponse;
import com.gestionvacantes.dto.LoginRequest;
import com.gestionvacantes.entity.Usuario;
import com.gestionvacantes.exception.CredencialesInvalidasException;
import com.gestionvacantes.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioDao usuarioDao;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UsuarioDao usuarioDao,
                       JwtService jwtService,
                       PasswordEncoder passwordEncoder) {
        this.usuarioDao = usuarioDao;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {

        Usuario usuario = usuarioDao.findByEmail(request.getEmail())
                .orElseThrow(() -> new CredencialesInvalidasException("Credenciales inválidas"));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new CredencialesInvalidasException("La cuenta está deshabilitada");
        }

        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new CredencialesInvalidasException("Credenciales inválidas");
        }

        String token = jwtService.generarToken(usuario.getEmail(), usuario.getRol().name());

        return new AuthResponse(
                token,
                usuario.getEmail(),
                usuario.getRol().name(),
                null
        );
    }
}